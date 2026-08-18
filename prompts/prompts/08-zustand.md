Read AGENTS.md first and follow it strictly.

Integrate language selection state. Store the selected language using Zustand with the modern `@react-native-async-storage/async-storage` package. If an authenticated user has no selected language, route them to the language selection screen. Only after selecting a language should they access the home route (/). Preserve the existing UI exactly.

**State management requirements:**
- Wait for both Clerk's `isLoaded` to be true AND AsyncStorage hydration to complete before making routing decisions
- Distinguish between an uninitialized/unhydrated language value (hydration in progress) vs. a genuinely missing selection (no language chosen yet)
- **Per-user hydration:** Use Clerk's resolved `userId` to construct the namespaced storage key (`@lingua/selected-language:{userId}`). Before `userId` is available, do not construct keys or load persisted state. Reinitialize the Zustand store when `userId` changes, loading only that user's persisted selection. On sign-out, clear that user's persisted key from AsyncStorage and call `resetLanguageState()` to clear in-memory selection.
- Scope the persisted language selection to the authenticated `userId` so selections don't leak between users
- On sign-out, clear the language selection from AsyncStorage and reset Zustand state

Add a development-only button on the home screen to reset language selection for testing. The button should clear the live Zustand language-selection value and remove only the current user's namespaced `selected-language` key from AsyncStorage, without affecting other persisted state. Use the `clearSelectedLanguage` store method to ensure consistent behavior.