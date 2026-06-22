/*
  FAQ content (docs/content-and-assets.md recommended questions).
  Answers are PLACEHOLDER until approved (open-questions P1 #6).
*/

export type FaqItem = {
  question: string;
  answer: string;
};

export const faq: FaqItem[] = [
  {
    question: "What should I wear?",
    answer:
      "We'd love for you to dress in semi-formal attire. A more specific dress code will be confirmed closer to the date.",
  },
  {
    question: "Can I bring a plus-one?",
    answer:
      "No. Each invitation is reserved for the one guest named on it.",
  },
  {
    question: "Are children invited?",
    answer:
      "Only the guest whose name appears on the invitation is included.",
  },
  {
    question: "What time should I arrive?",
    answer:
      "Please aim to arrive at least 30 minutes before the ceremony start time so we can begin promptly.",
  },
  {
    question: "Is parking available?",
    answer: "Parking details will be confirmed once the venue is finalized.",
  },
  {
    question: "Are the ceremony and reception in the same place?",
    answer:
      "Venue details, including travel between locations, will be listed in the Places section above.",
  },
  {
    question: "Who should I contact if my plans change?",
    answer:
      "Please reach out to our wedding coordinator using the contact details in the footer.",
  },
  {
    question: "Can I update my RSVP?",
    answer:
      "Yes — you can update your response any time before the RSVP deadline. After the deadline, please contact us directly.",
  },
  {
    question: "What should I do if I lose my QR pass?",
    answer:
      "No problem — our team can look you up by name at check-in, and you can revisit this site to view your pass again.",
  },
];
