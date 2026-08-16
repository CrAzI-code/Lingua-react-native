Read AGENTS.md first and follow it strictly.

Integrate language selection state. Store the selected language using Zustand with the modern `@react-native-async-storage/async-storage` package. If an authenticated user has no selected language, route them to the language selection screen. Only after selecting a language should they access the home route (/). Preserve the existing UI exactly.

**State management requirements:**
- Wait for both Clerk's `isLoaded` to be true AND AsyncStorage hydration to complete before making routing decisions
- Distinguish between an uninitialized/unhydrated language value (hydration in progress) vs. a genuinely missing selection (no language chosen yet)
- Scope the persisted language selection to the authenticated `userId` so selections don't leak between users
- On sign-out, clear the language selection from AsyncStorage and reset Zustand state

Add a development-only button on the home screen to reset language selection for testing. The button should remove only the namespaced `selected-language` key from AsyncStorage, preserving all other persisted state.