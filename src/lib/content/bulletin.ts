/**
 * The Mibbi Bulletin: news from inside time.
 *
 * Static for now so the homepage ships; the admin CMS replaces this with a
 * `bulletins` table. Keep the shape stable so the components need no change.
 */
export type BulletinKind = "arrival" | "discovery" | "event" | "collectible" | "update";

export interface BulletinItem {
  id: string;
  kind: BulletinKind;
  title: string;
  body: string;
  /** Character slug who "reported" it, for the byline avatar. */
  reporter?: string;
  dateLabel: string;
  href?: string;
}

export const BULLETIN_KIND_LABEL: Record<BulletinKind, string> = {
  arrival: "New on the timeline",
  discovery: "Discovery",
  event: "Expedition",
  collectible: "Rare find",
  update: "World update",
};

export const BULLETIN: BulletinItem[] = [
  {
    id: "same-time",
    kind: "discovery",
    title: "Pyramids were being built on two continents at once.",
    body: "Around 2600 BCE, Egypt raised the Great Pyramid while Caral rose on the coast of Peru. Neither knew about the other.",
    reporter: "butter",
    dateLabel: "2600 BCE",
    href: "/atlas?year=-2600",
  },
  {
    id: "rex-closer",
    kind: "arrival",
    title: "T. rex lived closer to you than to Stegosaurus.",
    body: "Crumb checked three times. Eighty million years separate the two dinosaurs. Only sixty-six separate T. rex from you.",
    reporter: "crumb",
    dateLabel: "66 million years ago",
    href: "/timeline?focus=t-rex",
  },
  {
    id: "missing-bone",
    kind: "event",
    title: "Expedition: The Missing Bone.",
    body: "A strange bone by the river. Follow it back through deep time with Crumb. Unlocked by a real Crumb.",
    reporter: "crumb",
    dateLabel: "Adventure",
    href: "/adventures/the-missing-bone",
  },
  {
    id: "golden-crumb",
    kind: "collectible",
    title: "Golden Crumb has been spotted. Once.",
    body: "One in seventy-two boxes. It opens a secret expedition nobody is supposed to know about.",
    reporter: "crumb",
    dateLabel: "Rumour",
    href: "/mibbis/crumb",
  },
  {
    id: "atlas-open",
    kind: "update",
    title: "The Atlas is open.",
    body: "Pick any moment and see who was busy everywhere in the world at the same time. Noodle recommends the year 1200.",
    reporter: "noodle",
    dateLabel: "New",
    href: "/atlas?year=1200",
  },
];
