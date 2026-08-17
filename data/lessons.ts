import type { Lesson } from "@/types/learning";

export const lessons: Lesson[] = [
  {
    id: "spanish-greetings",
    unitId: "spanish-basics",
    languageId: "spanish",
    title: "Hello!",
    description: "Greet someone and ask how they are.",
    goal: "Use three common Spanish greetings in a short conversation.",
    xpReward: 10,
    vocabulary: [
      { term: "hola", translation: "hello", pronunciation: "OH-lah" },
      { term: "bien", translation: "well", pronunciation: "byen" },
      { term: "gracias", translation: "thank you", pronunciation: "GRAH-syahs" },
    ],
    phrases: [
      { text: "¿Cómo estás?", translation: "How are you?", pronunciation: "KOH-moh es-TAHS" },
      { text: "Estoy bien, gracias.", translation: "I am well, thank you." },
    ],
    activities: [
      {
        id: "spanish-greetings-choice",
        type: "multiple-choice",
        prompt: "What does “hola” mean?",
        choices: ["Hello", "Goodbye", "Please"],
        correctAnswer: "Hello",
      },
      {
        id: "spanish-greetings-speak",
        type: "speaking",
        prompt: "Say this greeting aloud.",
        phrase: "Hola, ¿cómo estás?",
        translation: "Hello, how are you?",
      },
    ],
    aiTeacherPrompt:
      "Teach a warm beginner Spanish audio lesson about greetings. Speak slowly, model each phrase, pause for repetition, and encourage the learner. Only use the vocabulary and phrases in this lesson.",
  },
  {
    id: "spanish-introductions",
    unitId: "spanish-basics",
    languageId: "spanish",
    title: "My Name Is...",
    description: "Introduce yourself and ask someone's name.",
    goal: "Give your name and ask another person for theirs.",
    xpReward: 10,
    vocabulary: [
      { term: "nombre", translation: "name", pronunciation: "NOHM-breh" },
      { term: "mucho gusto", translation: "nice to meet you" },
    ],
    phrases: [
      { text: "Me llamo Ana.", translation: "My name is Ana." },
      { text: "¿Cómo te llamas?", translation: "What is your name?" },
    ],
    activities: [
      {
        id: "spanish-introductions-translate",
        type: "translation",
        prompt: "Translate: My name is Ana.",
        acceptedAnswers: ["Me llamo Ana."],
      },
      {
        id: "spanish-introductions-speak",
        type: "speaking",
        prompt: "Introduce yourself using this pattern.",
        phrase: "Me llamo...",
        translation: "My name is...",
      },
    ],
    aiTeacherPrompt:
      "Lead a short beginner Spanish audio lesson on introductions. Demonstrate the phrases slowly, invite the learner to substitute their own name, and finish with a simple role-play.",
  },
  {
    id: "french-greetings",
    unitId: "french-basics",
    languageId: "french",
    title: "Bonjour!",
    description: "Say hello and use polite expressions.",
    goal: "Greet someone and politely say thank you in French.",
    xpReward: 10,
    vocabulary: [
      { term: "bonjour", translation: "hello", pronunciation: "bohn-ZHOOR" },
      { term: "merci", translation: "thank you", pronunciation: "mehr-SEE" },
      { term: "au revoir", translation: "goodbye", pronunciation: "oh ruh-VWAHR" },
    ],
    phrases: [
      { text: "Bonjour, ça va?", translation: "Hello, how are you?" },
      { text: "Ça va bien, merci.", translation: "I am well, thank you." },
    ],
    activities: [
      {
        id: "french-greetings-choice",
        type: "multiple-choice",
        prompt: "Which word means “thank you”?",
        choices: ["Bonjour", "Merci", "Au revoir"],
        correctAnswer: "Merci",
      },
      {
        id: "french-greetings-speak",
        type: "speaking",
        prompt: "Say the phrase aloud.",
        phrase: "Bonjour, ça va?",
        translation: "Hello, how are you?",
      },
    ],
    aiTeacherPrompt:
      "Teach a cheerful beginner French audio lesson about greetings and politeness. Speak clearly, explain when to use each phrase, and pause so the learner can repeat.",
  },
  {
    id: "japanese-greetings",
    unitId: "japanese-basics",
    languageId: "japanese",
    title: "Hello!",
    description: "Use simple Japanese greetings throughout the day.",
    goal: "Choose and say an appropriate basic Japanese greeting.",
    xpReward: 10,
    vocabulary: [
      { term: "こんにちは", translation: "hello", pronunciation: "kohn-nee-chee-wah" },
      { term: "おはよう", translation: "good morning", pronunciation: "oh-hah-yoh" },
      { term: "ありがとう", translation: "thank you", pronunciation: "ah-ree-gah-toh" },
    ],
    phrases: [
      { text: "おはようございます。", translation: "Good morning (polite)." },
      { text: "ありがとうございます。", translation: "Thank you (polite)." },
    ],
    activities: [
      {
        id: "japanese-greetings-choice",
        type: "multiple-choice",
        prompt: "Which greeting means “good morning”?",
        choices: ["おはよう", "こんにちは", "ありがとう"],
        correctAnswer: "おはよう",
      },
      {
        id: "japanese-greetings-speak",
        type: "speaking",
        prompt: "Repeat this polite greeting.",
        phrase: "おはようございます。",
        translation: "Good morning.",
      },
    ],
    aiTeacherPrompt:
      "Teach a gentle beginner Japanese audio lesson about greetings. Say each Japanese phrase naturally and then slowly, give a brief usage note, and allow time for repetition.",
  },
  {
    id: "german-greetings",
    unitId: "german-basics",
    languageId: "german",
    title: "Hallo!",
    description: "Greet someone and use polite German expressions.",
    goal: "Say hello, ask how someone is, and say thank you in German.",
    xpReward: 10,
    vocabulary: [
      { term: "Hallo", translation: "hello", pronunciation: "HAH-loh" },
      { term: "Danke", translation: "thank you", pronunciation: "DAHN-kuh" },
      { term: "Tschüss", translation: "goodbye", pronunciation: "choos" },
    ],
    phrases: [
      { text: "Wie geht es dir?", translation: "How are you?", pronunciation: "vee gate es deer" },
      { text: "Mir geht es gut, danke.", translation: "I am well, thank you." },
    ],
    activities: [
      {
        id: "german-greetings-choice",
        type: "multiple-choice",
        prompt: "Which word means “thank you”?",
        choices: ["Hallo", "Danke", "Tschüss"],
        correctAnswer: "Danke",
      },
      {
        id: "german-greetings-speak",
        type: "speaking",
        prompt: "Say this greeting aloud.",
        phrase: "Hallo, wie geht es dir?",
        translation: "Hello, how are you?",
      },
    ],
    aiTeacherPrompt:
      "Teach a friendly beginner German audio lesson about greetings. Speak clearly, model each phrase at natural and slow speeds, explain when it is used, and pause for repetition.",
  },
];
