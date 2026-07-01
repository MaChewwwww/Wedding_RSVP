/*
  Typed wedding content (docs/configuration.md "Site content configuration").
  This is PUBLIC, stable content only — never mix operational guest data here.
  Values marked PLACEHOLDER must be approved before production (see
  docs/content-and-assets.md content-freeze checklist).
*/

export type NavSection = {
  id: string;
  label: string;
};

export const site = {
  couple: {
    partnerOneName: "Jobert",
    partnerTwoName: "April",
    displayName: "Jobert & April",
    monogram: "J&A",
  },
  event: {
    // PLACEHOLDER — confirm final wedding date/time (open-questions P0 #1).
    weddingDate: "2026-07-21",
    startTime: "2026-07-21T15:00:00+08:00",
    endTime: "2026-07-21T19:00:00+08:00",
    location: "Iglesia Ni Cristo Locale of Metro Manila Hills, Rodriguez Rizal",
    timezone: "Asia/Manila",
    // Display-only mirror of the server RSVP_DEADLINE; the server value is
    // authoritative for any mutation decision.
    rsvpDeadlineDisplay: "July 8, 2026",
    supportContact: {
      name: "Bride & Groom",
      email: "parocha.johnmathew23@gmail.com",
      phone: "",
    },
  },
  navigation: {
    sections: [
      { id: "welcome", label: "Welcome" },
      { id: "pass", label: "Wedding Pass" },
      { id: "invitations", label: "Invitations" },
      { id: "story", label: "Our Story" },
      { id: "gallery", label: "Prenup" },
      { id: "places", label: "Places" },
      { id: "faq", label: "FAQ" },
      { id: "gift", label: "Gift" },
    ] satisfies NavSection[],
  },
  copy: {
    welcome: {
      thankYou:
        "Thank you for being part of our story. We can't wait to celebrate this day with you.",
    },
    // Approved announcement copy (docs/content-and-assets.md).
    announcement:
      "The countdown is on! We are so excited to gather our favorite people in one place for a day of love, laughter, and a lot of celebrating. Whether you are traveling from near or far, we appreciate you making the trip. Check out the schedule and venue details below for where you need to be and when!",
    giftMessage:
      "Your presence at our wedding is the greatest gift of all. Should you wish to honor us with a gift, a contribution toward our new life together would be warmly appreciated.",
    footer: "With love and gratitude,",
  },
  social: {
    // PLACEHOLDER — confirm hashtag (open-questions P1 #1).
    hashtag: "#JobertAndApril",
    shareImage: "/assets/bg2.png",
  },
} as const;

export type Site = typeof site;
