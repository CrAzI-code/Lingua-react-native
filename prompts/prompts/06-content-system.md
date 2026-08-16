Read AGENTS.md first and follow it strictly.

Create the learning content system using hardcoded TypeScript data. Add `types/learning.ts`, `data/languages.ts`, `data/units.ts`, and `data/lessons.ts`. Define supported languages, units, lessons, activities, vocabulary, phrases, lesson goals, and AI teacher prompts for future audio-based Vision Agent lessons. Include a small beginner-friendly sample dataset for a few languages and keep it simple, typed, and easy to extend.

**Structure requirements:**
- Use stable `languageId`, `unitId`, and `lessonId` fields in all types and datasets (not array positions or display names)
- Units must reference parent `languageId`; lessons must reference parent `unitId` and `languageId`
- Each lesson includes: goal (learning objective), phrases/vocabulary, AI teacher context/prompt, and image asset reference
- Provide helper functions to look up languages, units, and lessons by their respective IDs for reliable content resolution