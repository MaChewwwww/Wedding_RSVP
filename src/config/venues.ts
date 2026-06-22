/*
  Venue configuration (docs/configuration.md "Venue configuration").
  Use explicit, approved Google Maps URLs — never construct URLs from
  untrusted text. All entries below are PLACEHOLDER until venue details are
  confirmed (open-questions P0 #11).
*/

export type VenueType = "preparation" | "ceremony" | "reception";

export type Venue = {
  type: VenueType;
  name: string;
  address: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  arrivalNotes?: string;
  parkingNotes?: string;
  accessibilityNotes?: string;
  googleMapsUrl: string;
  image?: string;
  isPlaceholder: boolean;
};

export const venues: Venue[] = [
  {
    type: "preparation",
    name: "Preparation Venue",
    address: "To be confirmed",
    date: "2026-08-15",
    startTime: "08:00",
    endTime: "12:00",
    description:
      "Where the couple and entourage prepare before the ceremony. Details to follow.",
    googleMapsUrl: "https://maps.google.com/",
    isPlaceholder: true,
  },
  {
    type: "ceremony",
    name: "Wedding Venue",
    address: "To be confirmed",
    date: "2026-08-15",
    startTime: "14:00",
    endTime: "15:30",
    description:
      "The ceremony where Jobert and April exchange their vows. Details to follow.",
    googleMapsUrl: "https://maps.google.com/",
    image: "/assets/bg6.png",
    isPlaceholder: true,
  },
  {
    type: "reception",
    name: "Reception Venue",
    address: "To be confirmed",
    date: "2026-08-15",
    startTime: "17:00",
    endTime: "22:00",
    description:
      "Dinner, dancing, and celebration to follow the ceremony. Details to follow.",
    googleMapsUrl: "https://maps.google.com/",
    isPlaceholder: true,
  },
];
