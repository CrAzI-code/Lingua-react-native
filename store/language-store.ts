import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { LanguageId } from "@/types/learning";

const SELECTED_LANGUAGE_KEY = "@lingua/selected-language";

const getSelectedLanguageKey = (userId: string) => `${SELECTED_LANGUAGE_KEY}:${userId}`;

type LanguageStore = {
  activeUserId: string | null;
  hasHydrated: boolean;
  selectedLanguageId: LanguageId | null | undefined;
  hydrateLanguage: (userId: string) => Promise<void>;
  selectLanguage: (userId: string, languageId: LanguageId) => Promise<void>;
  clearSelectedLanguage: (userId: string) => Promise<void>;
  resetLanguageState: () => void;
};

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  activeUserId: null,
  hasHydrated: false,
  selectedLanguageId: undefined,
  hydrateLanguage: async (userId) => {
    const currentState = get();

    if (currentState.activeUserId === userId && currentState.hasHydrated) {
      return;
    }

    set({ activeUserId: userId, hasHydrated: false, selectedLanguageId: undefined });

    let selectedLanguageId: string | null = null;

    try {
      selectedLanguageId = await AsyncStorage.getItem(getSelectedLanguageKey(userId));
    } catch {
      // Treat an unavailable persisted value as no selection so the user can continue.
    }

    if (get().activeUserId !== userId) {
      return;
    }

    set({
      hasHydrated: true,
      selectedLanguageId: selectedLanguageId as LanguageId | null,
    });
  },
  selectLanguage: async (userId, selectedLanguageId) => {
    await AsyncStorage.setItem(getSelectedLanguageKey(userId), selectedLanguageId);

    set({ activeUserId: userId, hasHydrated: true, selectedLanguageId });
  },
  clearSelectedLanguage: async (userId) => {
    await AsyncStorage.removeItem(getSelectedLanguageKey(userId));

    if (get().activeUserId === userId) {
      set({ hasHydrated: true, selectedLanguageId: null });
    }
  },
  resetLanguageState: () =>
    set({ activeUserId: null, hasHydrated: false, selectedLanguageId: undefined }),
}));
