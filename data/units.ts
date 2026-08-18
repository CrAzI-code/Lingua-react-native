import type { Unit } from "@/types/learning";

export const units: Unit[] = [
  {
    id: "spanish-basics",
    languageId: "spanish",
    title: "At the Café",
    description: "Build confidence with everyday Spanish conversations.",
    order: 3,
    lessonIds: [
      "spanish-greetings",
      "spanish-introductions",
      "spanish-cafe",
      "spanish-directions",
      "spanish-shopping",
      "spanish-family",
    ],
  },
  {
    id: "french-basics",
    languageId: "french",
    title: "La vie quotidienne",
    description: "Build practical French for everyday life.",
    order: 3,
    lessonIds: [
      "french-greetings",
      "french-introductions",
      "french-cafe",
      "french-directions",
      "french-shopping",
      "french-family",
    ],
  },
  {
    id: "japanese-basics",
    languageId: "japanese",
    title: "Everyday Japanese",
    description: "Use friendly Japanese in common daily situations.",
    order: 3,
    lessonIds: [
      "japanese-greetings",
      "japanese-introductions",
      "japanese-cafe",
      "japanese-directions",
      "japanese-shopping",
      "japanese-family",
    ],
  },
  {
    id: "german-basics",
    languageId: "german",
    title: "Alltag auf Deutsch",
    description: "Learn useful German for everyday situations.",
    order: 3,
    lessonIds: [
      "german-greetings",
      "german-introductions",
      "german-cafe",
      "german-directions",
      "german-shopping",
      "german-family",
    ],
  },
];
