export type LanguageId =
  | "spanish"
  | "french"
  | "japanese"
  | "korean"
  | "german"
  | "chinese";

export type Language = {
  id: LanguageId;
  name: string;
  nativeName: string;
  code: "es" | "fr" | "ja" | "ko" | "de" | "zh";
  flag: string;
  learnerCount: string;
  description: string;
};

export type VocabularyItem = {
  term: string;
  translation: string;
  pronunciation?: string;
};

export type Phrase = {
  text: string;
  translation: string;
  pronunciation?: string;
};

type ActivityBase = {
  id: string;
  prompt: string;
};

export type MultipleChoiceActivity = ActivityBase & {
  type: "multiple-choice";
  choices: string[];
  correctAnswer: string;
};

export type TranslationActivity = ActivityBase & {
  type: "translation";
  acceptedAnswers: string[];
};

export type SpeakingActivity = ActivityBase & {
  type: "speaking";
  phrase: string;
  translation: string;
};

export type Activity =
  | MultipleChoiceActivity
  | TranslationActivity
  | SpeakingActivity;

export type Lesson = {
  id: string;
  unitId: string;
  languageId: LanguageId;
  title: string;
  description: string;
  goal: string;
  xpReward: number;
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
  activities: Activity[];
  aiTeacherPrompt: string;
};

export type Unit = {
  id: string;
  languageId: LanguageId;
  title: string;
  description: string;
  order: number;
  lessonIds: string[];
};
