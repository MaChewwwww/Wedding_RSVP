/*
  Venue configuration (docs/configuration.md "Venue configuration").
  Use explicit, approved Google Maps URLs — never construct URLs from
  untrusted text.
*/

export type VenueType = "ceremony" | "reception";

export type Venue = {
  type: VenueType;
  name: string;
  address: string;
  date: string;
  /** Human-facing time label, e.g. "3:00 PM++". */
  timeLabel: string;
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
    type: "ceremony",
    name: "Iglesia Ni Cristo Locale of Metro Manila Hills",
    address: "Metro Manila Hills, San Jose, Rodriguez, Rizal",
    date: "2026-07-21",
    timeLabel: "3:00 PM++",
    description:
      "The ceremony where Jobert and April exchange their vows.",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Q45J%2BF4C%20San%20Jose%20Rodriguez%20Rizal",
    image: "/assets/wedding_venue.jpg",
    isPlaceholder: false,
  },
  {
    type: "reception",
    name: "Costa Abril Resort",
    address: "49 Dao St, Rodriguez, Rizal, Philippines",
    date: "2026-07-21",
    timeLabel: "7:00 PM++",
    description:
      "Dinner, dancing, and celebration to follow the ceremony.",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Costa%20Abril%20Resort%2049%20Dao%20St%20Rodriguez%20Rizal",
    image: "/assets/reception_venue.jpg",
    isPlaceholder: false,
  },
];
