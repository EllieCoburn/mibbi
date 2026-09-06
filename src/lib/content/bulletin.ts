/**
 * The Mibbi Bulletin: news from inside the world.
 *
 * Static for now so the homepage ships; Phase 7 replaces this with a
 * `bulletins` table managed from the admin dashboard. Keep the shape stable
 * so the components need no change when that happens.
 */
export type BulletinKind = "arrival" | "discovery" | "event" | "collectible" | "update";

export interface BulletinItem {
  id: string;
  kind: BulletinKind;
  title: string;
  body: string;
  /** Character slug who "reported" it, for the byline avatar. */
  reporter?: string;
  /** Short date label; free text so the fiction can be playful. */
  dateLabel: string;
  href?: string;
}

export const BULLETIN_KIND_LABEL: Record<BulletinKind, string> = {
  arrival: "New Mibbi",
  discovery: "New area",
  event: "Event",
  collectible: "Limited",
  update: "World update",
};

export const BULLETIN: BulletinItem[] = [
  {
    id: "noodle-arrives",
    kind: "arrival",
    title: "Someone new is on the road to Cozy Town.",
    body: "A bunny with a map, a snack and no plan. Noodle arrives with Series 02.",
    reporter: "noodle",
    dateLabel: "Coming soon",
    href: "/mibbis",
  },
  {
    id: "forest-path",
    kind: "discovery",
    title: "A path has appeared behind the Bakery.",
    body: "It leads into Mibbi Forest. Crumb would like everyone to be careful.",
    reporter: "crumb",
    dateLabel: "This week",
    href: "/world",
  },
  {
    id: "weekend-bake",
    kind: "event",
    title: "Weekend Bake-Off at the Bakery.",
    body: "Play Bakery Catch all weekend for double coins. Toast will supervise (asleep).",
    reporter: "toast",
    dateLabel: "Sat–Sun",
    href: "/games",
  },
  {
    id: "golden-crumb",
    kind: "collectible",
    title: "Golden Crumb has been spotted. Once.",
    body: "One in seventy-two boxes. Nobody is supposed to know about this.",
    reporter: "crumb",
    dateLabel: "Rumour",
    href: "/mibbis/crumb",
  },
  {
    id: "rooms-open",
    kind: "update",
    title: "Rooms are open for decorating.",
    body: "Rugs, lamps, a bed shaped like a loaf. Butter thinks yours could use a cushion.",
    reporter: "butter",
    dateLabel: "New",
    href: "/home",
  },
];
