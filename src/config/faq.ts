/*
  FAQ content (docs/content-and-assets.md recommended questions).
  Answers are PLACEHOLDER until approved (open-questions P1 #6).
*/

export type FaqItem = {
  question: string;
  answer: string;
  /** Optional pastel color swatches shown as circular samples under the answer. */
  swatches?: string[];
};

export const faq: FaqItem[] = [
  {
    question: "What should I wear?",
    answer:
      "We'd love for you to dress in semi-formal attire in soft pastel tones. Here are a few colors to inspire your outfit:",
    swatches: ["#f0a8bc", "#8fbc8b", "#90bfd8", "#b5a0d5", "#f0c84a", "#c47b56"],
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
    answer: "Parking is available in both wedding and reception.",
  },
  {
    question: "Who should I contact if my plans change?",
    answer: "Please reach out the bride and groom.",
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
