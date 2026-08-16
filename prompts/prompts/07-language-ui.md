Read AGENTS.md first and follow it strictly.

Implement the language selection screen UI based on the attached design. Use the hardcoded languages from `data/languages.ts` and the existing NativeWind/global.css design utilities.

**Implementation requirements:**
- Define a language-selection route constant (e.g., `/language-selection`) and reuse it in both the home-screen navigation link and the language guard routing logic to avoid hardcoding
- Add the earth image to `constants/images.ts` and load it from there instead of referencing the asset directly
- The confirmation button should emit the stable `languageId` from the selected language object
- Disable the confirmation button when no language is selected; enable only after a language is selected

@prompt_material/04-language-selection-screen.png