import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { posthog } from "@/config/posthog";
import { images } from "@/constants/images";
import { LANGUAGE_SELECTION_ROUTE } from "@/constants/routes";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { units } from "@/data/units";
import { useLanguageStore } from "@/store/language-store";
import type { Lesson } from "@/types/learning";

type LessonStatus = "completed" | "in-progress" | "not-started";

const defaultLessonImage =
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85";

export default function LearnScreen() {
  const router = useRouter();
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
  const activeUnit = units
    .filter((unit) => unit.languageId === selectedLanguageId)
    .sort((firstUnit, secondUnit) => firstUnit.order - secondUnit.order)[0];
  const unitLessons = activeUnit
    ? activeUnit.lessonIds
        .map((lessonId) => lessons.find((lesson) => lesson.id === lessonId))
        .filter((lesson): lesson is Lesson => Boolean(lesson))
    : [];
  const inProgressIndex = Math.min(2, Math.max(unitLessons.length - 1, 0));
  const inProgressLesson = unitLessons[inProgressIndex];

  if (!selectedLanguage || !activeUnit || !inProgressLesson) {
    return <Redirect href={LANGUAGE_SELECTION_ROUTE} />;
  }

  const progressCount = Math.min(inProgressIndex + 1, unitLessons.length);
  const openLesson = (lesson: Lesson) => {
    posthog?.capture("lesson_selected", {
      lesson_id: lesson.id,
      language_id: selectedLanguageId,
      entry_point: "learn_tab",
    });
    router.push({ pathname: "/(tabs)/learn/[id]", params: { id: lesson.id } });
  };

  return (
    <View className="flex-1 bg-background">
      <View className="z-10 flex-row items-start border-b border-[#edf0f7] bg-white px-5 pb-3 pt-7">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="mr-3 h-11 w-11 items-center justify-center active:opacity-70"
          onPress={() => router.replace("/")}
        >
          <Ionicons color="#0D132B" name="chevron-back" size={31} />
        </Pressable>
        <View className="flex-1 pt-0.5">
          <Text className="h3 text-text-primary" numberOfLines={1}>
            {activeUnit.title}
          </Text>
          <Text className="mt-1 font-poppins-medium text-[15px] leading-5 text-[#5e6d90]">
            Unit {activeUnit.order} {"\u2022"} {progressCount} / {unitLessons.length} lessons
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Bookmark this unit"
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center active:opacity-70"
        >
          <Ionicons color="#ff9f1c" name="bookmark-outline" size={27} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 26 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative h-[362px] overflow-hidden bg-[#eff7ff]">
        <Image
          source={{ uri: inProgressLesson.imageUrl ?? defaultLessonImage }}
          className="absolute inset-0 h-full w-full opacity-80"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-[#eaf5ff]/35" />

        <View className="hidden z-10 flex-row items-start px-5 pb-3 pt-7">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="mr-3 h-11 w-11 items-center justify-center active:opacity-70"
            onPress={() => router.replace("/")}
          >
            <Ionicons color="#0D132B" name="chevron-back" size={31} />
          </Pressable>
          <View className="flex-1 pt-0.5">
            <Text className="h3 text-text-primary" numberOfLines={1}>
              {activeUnit.title}
            </Text>
            <Text className="mt-1 font-poppins-medium text-[15px] leading-5 text-[#5e6d90]">
              Unit {activeUnit.order} • {progressCount} / {unitLessons.length} lessons
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Bookmark this unit"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center active:opacity-70"
          >
            <Ionicons color="#ff9f1c" name="bookmark-outline" size={27} />
          </Pressable>
        </View>

        <View className="absolute bottom-0 left-0 right-0 h-48 bg-white/35" />
        <Image
          source={images.mascotWelcome}
          className="absolute -bottom-8 left-[28%] h-[255px] w-[255px]"
          resizeMode="contain"
        />
      </View>

      <View className="-mt-1 flex-row rounded-b-[28px] bg-[#f9f9ff] px-5 pt-1 shadow-sm">
        <View className="h-[76px] flex-1 items-center justify-center rounded-t-[25px] border-b-4 border-lingua-purple bg-white">
          <Text className="font-poppins-semibold text-[19px] text-lingua-purple">Lessons</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="h-[76px] flex-1 items-center justify-center active:opacity-70"
        >
          <Text className="font-poppins-medium text-[19px] text-[#53617f]">Practice</Text>
        </Pressable>
      </View>

      <View className="gap-3 px-6 pt-7">
        {unitLessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            lessonNumber={index + 1}
            onPress={() => openLesson(lesson)}
            status={getLessonStatus(index, inProgressIndex)}
          />
        ))}
        </View>
      </ScrollView>
    </View>
  );
}

function getLessonStatus(index: number, inProgressIndex: number): LessonStatus {
  if (index < inProgressIndex) {
    return "completed";
  }

  return index === inProgressIndex ? "in-progress" : "not-started";
}

type LessonCardProps = {
  lesson: Lesson;
  lessonNumber: number;
  onPress: () => void;
  status: LessonStatus;
};

function LessonCard({ lesson, lessonNumber, onPress, status }: LessonCardProps) {
  const isInProgress = status === "in-progress";
  const isCompleted = status === "completed";

  return (
    <Pressable
      accessibilityHint="Opens this lesson"
      accessibilityLabel={`Lesson ${lessonNumber}: ${lesson.title}`}
      accessibilityRole="button"
      className={`min-h-[112px] flex-row items-center rounded-[23px] border bg-white px-6 py-4 active:opacity-75 ${
        isInProgress ? "border-2 border-[#9f86ff] bg-[#fcfbff]" : "border-[#edf0f7]"
      }`}
      onPress={onPress}
    >
      <View className="flex-1 pr-3">
        <Text
          className={`font-poppins-medium text-[16px] leading-6 ${
            isInProgress ? "text-lingua-purple" : "text-[#66728d]"
          }`}
        >
          Lesson {lessonNumber}
        </Text>
        <Text className="mt-1 font-poppins-medium text-[19px] leading-6 text-text-primary">
          {lesson.title}
        </Text>
        {isInProgress ? (
          <Text className="mt-1 font-poppins-medium text-[16px] text-lingua-purple">In progress</Text>
        ) : !isCompleted ? (
          <Text className="mt-1 font-poppins text-[14px] text-[#7a849b]">0 / 6 lessons</Text>
        ) : null}
      </View>

      {isCompleted ? (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#22c632]">
          <Ionicons color="#FFFFFF" name="checkmark" size={23} />
        </View>
      ) : isInProgress ? (
        <Image source={images.mascotLogo} className="h-14 w-14" resizeMode="contain" />
      ) : (
        <View className="h-10 w-10 items-center justify-center">
          <Ionicons color="#596784" name="lock-closed-outline" size={27} />
        </View>
      )}
    </Pressable>
  );
}
