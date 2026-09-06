#!/usr/bin/env node
/**
 * Generates src/types/database.ts from a live Postgres database WITHOUT Docker.
 *
 * Supabase's own generator (`supabase gen types typescript`) is the preferred
 * path once the project is linked; this script exists so types can be
 * regenerated in Docker-less environments (CI, this repo's SQL test runner).
 * It emits the same `Database` shape supabase-js expects.
 *
 * Usage: DATABASE_URL=postgres://... node scripts/gen-types.mjs > src/types/database.ts
 */
import { execFileSync } from "node:child_process";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

/** Runs a query and returns rows as JSON. */
function query(sql) {
  const out = execFileSync("psql", [url, "-At", "-v", "ON_ERROR_STOP=1", "-c", `select coalesce(json_agg(t), '[]') from (${sql}) t`], { encoding: "utf8" });
  return JSON.parse(out.trim());
}

const enums = query(`
  select t.typname as name, array_agg(e.enumlabel order by e.enumsortorder) as labels
  from pg_type t
  join pg_enum e on e.enumtypid = t.oid
  join pg_namespace n on n.oid = t.typnamespace
  where n.nspname = 'public'
  group by t.typname order by t.typname
`);

const columns = query(`
  select c.table_name, c.column_name, c.data_type, c.udt_name, c.is_nullable = 'YES' as nullable,
         c.column_default is not null as has_default, c.is_identity = 'YES' as identity, c.identity_generation = 'ALWAYS' as identity_always,
         c.is_generated = 'ALWAYS' as generated, c.ordinal_position,
         (select relkind from pg_class where relname = c.table_name and relnamespace = 'public'::regnamespace) as relkind
  from information_schema.columns c
  where c.table_schema = 'public'
  order by c.table_name, c.ordinal_position
`);

const fks = query(`
  select con.conname as name,
         cl.relname as table_name,
         (select array_agg(a.attname order by k.ord) from unnest(con.conkey) with ordinality k(attnum, ord)
            join pg_attribute a on a.attrelid = con.conrelid and a.attnum = k.attnum) as columns,
         fcl.relname as referenced_relation,
         (select array_agg(a.attname order by k.ord) from unnest(con.confkey) with ordinality k(attnum, ord)
            join pg_attribute a on a.attrelid = con.confrelid and a.attnum = k.attnum) as referenced_columns,
         con.conkey as conkey, cl.oid as reloid
  from pg_constraint con
  join pg_class cl on cl.oid = con.conrelid
  join pg_class fcl on fcl.oid = con.confrelid
  where con.contype = 'f' and con.connamespace = 'public'::regnamespace
  order by cl.relname, con.conname
`);

const uniques = query(`
  select cl.relname as table_name, con.conkey as conkey
  from pg_constraint con join pg_class cl on cl.oid = con.conrelid
  where con.contype in ('p','u') and con.connamespace = 'public'::regnamespace and array_length(con.conkey, 1) = 1
`);

const functions = query(`
  select p.proname as name,
         coalesce(p.proargnames, '{}') as argnames,
         (select array_agg(format_type(t, null)) from unnest(p.proargtypes) t) as argtypes,
         p.pronargdefaults as ndefaults,
         format_type(p.prorettype, null) as rettype,
         p.proretset as retset
  from pg_proc p
  where p.pronamespace = 'public'::regnamespace
    and p.prokind = 'f'
    and p.prorettype <> 'trigger'::regtype
    and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  order by p.proname
`);

const enumNames = new Set(enums.map((e) => e.name));

function tsType(dataType, udt) {
  const base = udt.replace(/^_/, "");
  const isArray = dataType === "ARRAY";
  let t;
  if (enumNames.has(base)) t = `Database["public"]["Enums"]["${base}"]`;
  else
    switch (base) {
      case "uuid":
      case "text":
      case "citext":
      case "varchar":
      case "bpchar":
      case "char":
      case "date":
      case "timestamp":
      case "timestamptz":
      case "time":
      case "timetz":
      case "interval":
      case "bytea":
        t = "string";
        break;
      case "int2":
      case "int4":
      case "int8":
      case "float4":
      case "float8":
      case "numeric":
      case "oid":
        t = "number";
        break;
      case "bool":
        t = "boolean";
        break;
      case "json":
      case "jsonb":
        t = "Json";
        break;
      default:
        t = "unknown";
    }
  return isArray ? `${t}[]` : t;
}

function sqlTypeToTs(sqlType) {
  const arr = sqlType.endsWith("[]");
  const base = arr ? sqlType.slice(0, -2) : sqlType;
  const map = {
    uuid: "string",
    text: "string",
    citext: "string",
    "character varying": "string",
    date: "string",
    "timestamp with time zone": "string",
    "timestamp without time zone": "string",
    integer: "number",
    bigint: "number",
    smallint: "number",
    numeric: "number",
    "double precision": "number",
    real: "number",
    boolean: "boolean",
    json: "Json",
    jsonb: "Json",
    void: "undefined",
  };
  let t = map[base];
  if (!t && enumNames.has(base)) t = `Database["public"]["Enums"]["${base}"]`;
  if (!t) t = "unknown";
  return arr ? `${t}[]` : t;
}

const byTable = new Map();
for (const c of columns) {
  if (!byTable.has(c.table_name)) byTable.set(c.table_name, { relkind: c.relkind, cols: [] });
  byTable.get(c.table_name).cols.push(c);
}

const uniqueCols = new Set(uniques.map((u) => `${u.table_name}:${u.conkey[0]}`));

function relationships(table) {
  const rels = fks.filter((f) => f.table_name === table);
  if (rels.length === 0) return "Relationships: []";
  const lines = rels.map((r) => {
    const isOne = r.columns.length === 1 && uniqueCols.has(`${table}:${r.conkey[0]}`);
    return `          {
            foreignKeyName: "${r.name}"
            columns: [${r.columns.map((c) => `"${c}"`).join(", ")}]
            isOneToOne: ${isOne}
            referencedRelation: "${r.referenced_relation}"
            referencedColumns: [${r.referenced_columns.map((c) => `"${c}"`).join(", ")}]
          }`;
  });
  return `Relationships: [\n${lines.join(",\n")}\n        ]`;
}

let out = `// AUTO-GENERATED by scripts/gen-types.mjs — do not edit by hand.
// Regenerate with: pnpm db:types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
`;

const tables = [...byTable.entries()].filter(([, v]) => v.relkind === "r").sort();
const views = [...byTable.entries()].filter(([, v]) => v.relkind === "v").sort();

for (const [name, { cols }] of tables) {
  const row = cols.map((c) => `          ${c.column_name}: ${tsType(c.data_type, c.udt_name)}${c.nullable ? " | null" : ""}`).join("\n");
  const insert = cols
    .filter((c) => !c.generated && !(c.identity && c.identity_always))
    .map((c) => {
      const optional = c.nullable || c.has_default || c.identity;
      return `          ${c.column_name}${optional ? "?" : ""}: ${tsType(c.data_type, c.udt_name)}${c.nullable ? " | null" : ""}`;
    })
    .join("\n");
  const update = cols
    .filter((c) => !c.generated)
    .map((c) => `          ${c.column_name}?: ${tsType(c.data_type, c.udt_name)}${c.nullable ? " | null" : ""}`)
    .join("\n");
  out += `      ${name}: {
        Row: {
${row}
        }
        Insert: {
${insert}
        }
        Update: {
${update}
        }
        ${relationships(name)}
      }
`;
}

out += `    }
    Views: {
`;
for (const [name, { cols }] of views) {
  const row = cols.map((c) => `          ${c.column_name}: ${tsType(c.data_type, c.udt_name)}${c.nullable ? " | null" : ""}`).join("\n");
  out += `      ${name}: {
        Row: {
${row}
        }
        Relationships: []
      }
`;
}

out += `    }
    Functions: {
`;
for (const f of functions) {
  const argtypes = f.argtypes ?? [];
  const nreq = argtypes.length - f.ndefaults;
  const args = argtypes.map((t, i) => `          ${f.argnames[i] ?? `arg${i}`}${i >= nreq ? "?" : ""}: ${sqlTypeToTs(t)}`).join("\n");
  const ret = sqlTypeToTs(f.rettype);
  out += `      ${f.name}: {
        Args: ${args ? `{\n${args}\n        }` : "Record<PropertyKey, never>"}
        Returns: ${f.retset ? `${ret}[]` : ret}
      }
`;
}

out += `    }
    Enums: {
`;
for (const e of enums) {
  out += `      ${e.name}: ${e.labels.map((l) => `"${l}"`).join(" | ")}\n`;
}
out += `    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
`;

process.stdout.write(out);
