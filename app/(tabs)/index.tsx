import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect } from "expo-router";
import { useEffect } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { LANGUAGE_SELECTION_ROUTE } from "@/constants/routes";
import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { useLanguageStore } from "@/store/language-store";

const DAILY_GOAL_XP = 20;

const greetingByLanguage = {
  es: "Hola",
  fr: "Bonjour",
  ja: "こんにちは",
  ko: "안녕하세요",
  de: "Hallo",
  zh: "你好",
} as const;

export default function Index() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
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

  const currentLesson = lessons.find((lesson) => lesson.languageId === selectedLanguage.id);
  const dailyProgressXp = Math.min(currentLesson?.xpReward ?? 0, DAILY_GOAL_XP);
  const progressPercent = (dailyProgressXp / DAILY_GOAL_XP) * 100;
  const learnerName = user?.firstName || user?.username || "there";
  const greeting = greetingByLanguage[selectedLanguage.code];
  const lessonSubtitle = currentLesson
    ? `Unit 1 · ${currentLesson.title}`
    : "Unit 1 · First steps";
  const vocabularyCount = currentLesson?.vocabulary.length ?? 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: 30, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-6 px-7">
        <View className="flex-row items-center">
          <View className="mr-4 flex-1 flex-row items-center gap-3">
            <Image
              source={{ uri: selectedLanguage.flag }}
              className="h-11 w-11 shrink-0 rounded-full border border-white"
            />
            <Text
              className="flex-1 font-poppins-semibold text-[19px] leading-6 text-text-primary"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {greeting}, {learnerName}! 👋
            </Text>
          </View>

          <View className="mr-5 shrink-0 flex-row items-center gap-1.5">
            <Image source={images.streakFire} className="h-8 w-8" resizeMode="contain" />
            <Text className="font-poppins-medium text-lg text-text-secondary">12</Text>
          </View>
          <Pressable accessibilityLabel="Notifications" className="p-1 active:opacity-70">
            <Ionicons color="#0D132B" name="notifications-outline" size={27} />
          </Pressable>
        </View>

        <View className="relative h-[156px] overflow-hidden rounded-[25px] bg-[#fff8f0] px-6 py-5">
          <Text className="font-poppins-medium text-lg text-text-primary">Daily goal</Text>
          <View className="mt-1 flex-row items-baseline">
            <Text className="font-poppins-semibold text-[34px] leading-[43px] text-text-primary">
              {dailyProgressXp}
            </Text>
            <Text className="ml-2 font-poppins-medium text-lg text-text-secondary">
              / {DAILY_GOAL_XP} XP
            </Text>
          </View>
          <View className="mt-3 h-2.5 w-[260px] overflow-hidden rounded-full bg-[#ffe5c9]">
            <View className="h-full rounded-full bg-[#ff8613]" style={{ width: `${progressPercent}%` }} />
          </View>
          <Image
            source={images.treasure}
            className="absolute -right-1 top-3 h-[124px] w-[124px]"
            resizeMode="contain"
          />
        </View>

        <View className="relative h-[215px] overflow-hidden rounded-[25px] bg-[#6245ef] px-6 py-6">
          <View className="absolute -right-3 -top-10 h-52 w-52 rounded-full bg-[#7a61f5] opacity-60" />
          <View className="max-w-[190px]">
            <Text className="font-poppins-medium text-lg text-white">Continue learning</Text>
            <Text className="mt-1 font-poppins-semibold text-[31px] leading-10 text-white">
              {selectedLanguage.name}
            </Text>
            <Text className="mt-0.5 font-poppins-medium text-lg text-[#eeeaff]">
              {lessonSubtitle}
            </Text>
          </View>
          <Image
            source={images.palace}
            className="absolute -bottom-4 -right-5 h-[190px] w-[232px]"
            resizeMode="contain"
          />
          {currentLesson ? (
            <Link
              href={{ pathname: "/(tabs)/learn/[id]", params: { id: currentLesson.id } }}
              asChild
            >
              <Pressable className="absolute bottom-4 left-6 rounded-2xl bg-white px-6 py-3 active:opacity-85">
                <Text className="font-poppins-semibold text-lg text-lingua-purple">Continue</Text>
              </Pressable>
            </Link>
          ) : (
            <Pressable className="absolute bottom-4 left-6 rounded-2xl bg-white px-6 py-3 active:opacity-85">
              <Text className="font-poppins-semibold text-lg text-lingua-purple">Continue</Text>
            </Pressable>
          )}
        </View>

        <View className="-mt-0.5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-poppins-semibold text-[20px] leading-7 text-text-primary">
              Today&apos;s plan
            </Text>
            <Pressable accessibilityRole="button" className="active:opacity-70">
              <Text className="font-poppins-semibold text-lg text-lingua-purple">View all</Text>
            </Pressable>
          </View>

          <View className="gap-5">
            <PlanItem
              detail={currentLesson?.description ?? `Begin your ${selectedLanguage.name} journey`}
              icon="book"
              isComplete={dailyProgressXp > 0}
              title="Lesson"
            />
            <PlanItem
              detail={currentLesson?.goal ?? "Practice a short conversation"}
              icon="headset"
              title="AI Conversation"
            />
            <PlanItem
              detail={`${vocabularyCount} words`}
              icon="chatbox-ellipses"
              iconColor="bg-[#ff6068]"
              title="New words"
            />
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

type PlanItemProps = {
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  isComplete?: boolean;
  title: string;
};

function PlanItem({
  detail,
  icon,
  iconColor = "bg-lingua-purple",
  isComplete = false,
  title,
}: PlanItemProps) {
  return (
    <View className="flex-row items-center">
      <View className={`h-[54px] w-[54px] items-center justify-center rounded-xl ${iconColor}`}>
        <Ionicons color="#FFFFFF" name={icon} size={27} />
      </View>
      <View className="ml-5 flex-1">
        <Text className="font-poppins-medium text-lg text-text-primary">{title}</Text>
        <Text className="mt-0.5 body-medium text-text-secondary" numberOfLines={1}>
          {detail}
        </Text>
      </View>
      {isComplete ? (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-lingua-purple">
          <Ionicons color="#FFFFFF" name="checkmark" size={21} />
        </View>
      ) : (
        <View className="h-8 w-8 rounded-full border-2 border-[#8d96af]" />
      )}
    </View>
  );
}
