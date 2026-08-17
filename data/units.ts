import type { Unit } from "@/types/learning";

export const units: Unit[] = [
  {
    id: "spanish-basics",
    languageId: "spanish",
    title: "Spanish Basics",
    description: "Say hello and introduce yourself.",
    order: 1,
    lessonIds: ["spanish-greetings", "spanish-introductions"],
  },
  {
    id: "french-basics",
    languageId: "french",
    title: "French Basics",
    description: "Learn greetings and polite expressions.",
    order: 1,
    lessonIds: ["french-greetings"],
  },
  {
    id: "japanese-basics",
    languageId: "japanese",
    title: "Japanese Basics",
    description: "Practice greetings for different times of day.",
    order: 1,
    lessonIds: ["japanese-greetings"],
  },
  {
    id: "german-basics",
    languageId: "german",
    title: "German Basics",
    description: "Learn greetings and polite expressions.",
    order: 1,
    lessonIds: ["german-greetings"],
  },
];
