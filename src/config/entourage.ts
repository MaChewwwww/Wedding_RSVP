/*
  Entourage content (docs/content-and-assets.md). All entries PLACEHOLDER until
  names, roles, descriptions, and portraits are approved (open-questions P1 #5).
*/

export type EntourageMember = {
  name: string;
  role: string;
  description?: string;
  portrait?: string;
};

export type EntourageGroup = {
  title: string;
  members: EntourageMember[];
};

export const entourage: EntourageGroup[] = [
  {
    title: "Principal Sponsors",
    members: [
      { name: "To be announced", role: "Ninong" },
      { name: "To be announced", role: "Ninang" },
    ],
  },
  {
    title: "Bridesmaids",
    members: [
      { name: "To be announced", role: "Maid of Honor" },
      { name: "To be announced", role: "Bridesmaid" },
    ],
  },
  {
    title: "Groomsmen",
    members: [
      { name: "To be announced", role: "Best Man" },
      { name: "To be announced", role: "Groomsman" },
    ],
  },
];

export const isEntouragePlaceholder = true;
