import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { LANGUAGE_SELECTION_ROUTE } from "@/constants/routes";
import { languages } from "@/data/languages";
import { useLanguageStore } from "@/store/language-store";

export default function Index() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const activeUserId = useLanguageStore((state) => state.activeUserId);
  const hasHydrated = useLanguageStore((state) => state.hasHydrated);
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const hydrateLanguage = useLanguageStore((state) => state.hydrateLanguage);

  useEffect(() => {
    if (isLoaded && isSignedIn && userId && activeUserId !== userId) {
      void hydrateLanguage(userId);
    }
  }, [activeUserId, hydrateLanguage, isLoaded, isSignedIn, userId]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!userId || activeUserId !== userId || !hasHydrated || selectedLanguageId === undefined) {
    return null;
  }

  if (selectedLanguageId === null) {
    return <Redirect href={LANGUAGE_SELECTION_ROUTE} />;
  }

  const selectedLanguage = languages.find((language) => language.id === selectedLanguageId);

  if (!selectedLanguage) {
    return <Redirect href={LANGUAGE_SELECTION_ROUTE} />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="h2 text-text-primary">Home</Text>
      <Text className="mt-3 body-medium text-text-secondary">
        Home screen coming soon.
      </Text>
    </View>
  );
}
