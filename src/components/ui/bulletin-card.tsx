import Link from "next/link";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { BULLETIN_KIND_LABEL, type BulletinItem } from "@/lib/content/bulletin";
import type { CharacterSummary } from "@/lib/data/characters";

const KIND_COLOR: Record<BulletinItem["kind"], string> = {
  arrival: "var(--color-peach)",
  discovery: "var(--color-pistachio)",
  event: "var(--color-butter)",
  collectible: "var(--color-butter-deep)",
  update: "var(--color-dusty-soft)",
};

/** A newspaper-clipping style card with a stamp and a reporter byline. */
export function BulletinCard({ item, reporter, index = 0 }: { item: BulletinItem; reporter?: CharacterSummary; index?: number }) {
  const tilt = ["-rotate-1", "rotate-[0.75deg]", "rotate-1", "-rotate-[0.5deg]"][index % 4];
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="sticker px-2 py-0.5 text-[10px] text-chocolate" style={{ backgroundColor: KIND_COLOR[item.kind] }}>
          {BULLETIN_KIND_LABEL[item.kind]}
        </span>
        <span className="font-display text-xs font-bold text-ink-mute uppercase">{item.dateLabel}</span>
      </div>
      <h3 className="mt-3 font-display text-xl leading-tight font-bold text-chocolate">{item.title}</h3>
      <p className="mt-2 text-sm text-ink-soft">{item.body}</p>
      {reporter ? (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-ink-mute">
          <MibbiAvatar name={reporter.name} color={reporter.placeholder_color} shape={reporter.placeholder_shape} personalityKey={reporter.personality_key} imageUrl={reporter.thumbnail_url} size={28} />
          <span>Reported by {reporter.name}</span>
        </div>
      ) : null}
    </>
  );
  const cls = `chunky-sm block h-full rounded-2xl bg-paper p-5 transition-transform duration-200 hover:-translate-y-1 hover:rotate-0 ${tilt}`;
  return item.href ? (
    <Link href={item.href} className={cls}>
      {body}
    </Link>
  ) : (
    <article className={cls}>{body}</article>
  );
}
