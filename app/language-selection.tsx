import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";

import { images } from "@/constants/images";
import { posthog } from "@/config/posthog";
import { languages } from "@/data/languages";
import type { Language, LanguageId } from "@/types/learning";
import { useLanguageStore } from "@/store/language-store";

function emitLanguageConfirmation(languageId: LanguageId) {
  console.info("Selected language:", languageId);
}

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const selectLanguage = useLanguageStore((state) => state.selectLanguage);
  const [query, setQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleLanguages = languages.filter((language) =>
    [language.name, language.nativeName].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  );

  const handleConfirm = async () => {
    if (!selectedLanguage || !userId) {
      return;
    }

    await selectLanguage(userId, selectedLanguage.id);
    posthog?.capture("language_selected", {
      language_id: selectedLanguage.id,
      language_code: selectedLanguage.code,
    });
    emitLanguageConfirmation(selectedLanguage.id);
    router.replace("/");
  };

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-center px-5 pb-5 pt-4">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="absolute left-5 top-4 h-12 w-12 items-center justify-center active:opacity-70"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={32} color="#0D132B" />
          </Pressable>
          <Text className="h3 text-text-primary">Choose a language</Text>
        </View>

        <View className="mx-9 flex-row items-center rounded-[30px] border border-border bg-surface px-5 py-3">
          <Ionicons name="search-outline" size={26} color="#6B7280" />
          <TextInput
            accessibilityLabel="Search languages"
            className="ml-4 flex-1 font-poppins text-[16px] text-text-primary"
            onChangeText={setQuery}
            placeholder="Search languages"
            placeholderTextColor="#6B7280"
            value={query}
          />
        </View>

        <ScrollView
          className="mt-8 flex-1"
          contentContainerStyle={{ paddingHorizontal: 38, paddingBottom: 250 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="h4 mb-4 text-text-primary">Popular</Text>
          {visibleLanguages.map((language) => {
            const isSelected = selectedLanguage?.id === language.id;

            return (
              <Pressable
                key={language.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                className={`mb-1 min-h-[118px] flex-row items-center rounded-[26px] border px-4 ${
                  isSelected
                    ? "border-[2px] border-lingua-purple bg-[#F8F7FF]"
                    : "border-transparent bg-background"
                }`}
                onPress={() => setSelectedLanguage(language)}
              >
                <Image
                  source={{ uri: language.flag }}
                  className="h-[50px] w-[50px] rounded-full border border-border"
                  resizeMode="cover"
                />
                <View className="ml-5 flex-1">
                  <Text className="h3 text-text-primary">{language.name}</Text>
                  <Text className="body-medium mt-1 text-text-secondary">
                    {language.learnerCount}
                  </Text>
                </View>
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "chevron-forward"}
                  size={isSelected ? 38 : 28}
                  color={isSelected ? "#6C4EF5" : "#6B7280"}
                />
              </Pressable>
            );
          })}
          {visibleLanguages.length === 0 && (
            <Text className="body-medium text-center text-text-secondary">
              No languages found.
            </Text>
          )}
        </ScrollView>

        <Image
          source={images.earth}
          className="absolute bottom-0 h-[190px] w-full"
          resizeMode="contain"
        />
        <View className="absolute bottom-7 left-9 right-9">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !selectedLanguage }}
            className={`h-[72px] items-center justify-center rounded-[24px] ${
              selectedLanguage ? "bg-lingua-purple active:opacity-90" : "bg-border"
            }`}
            disabled={!selectedLanguage}
            onPress={() => void handleConfirm()}
          >
            <Text className="font-poppins-semibold text-[20px] text-white">
              Confirm language
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
