import { Ionicons } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";

export default function AudioLessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isListening, setIsListening] = useState(false);
  const [showLessonDetails, setShowLessonDetails] = useState(false);

  const lesson = lessons.find((item) => item.id === id);
  const language = lesson
    ? languages.find((item) => item.id === lesson.languageId)
    : undefined;

  if (!lesson || !language) {
    return <Redirect href="/(tabs)/learn" />;
  }

  const featuredPhrase = lesson.phrases[0] ?? {
    text: lesson.vocabulary[0]?.term ?? lesson.title,
    translation: lesson.vocabulary[0]?.translation ?? lesson.description,
  };

  return (
    <View className="flex-1 bg-[#fbfaff]">
      <View className="flex-row items-center bg-white px-5 pb-4 pt-4">
        <Pressable
          accessibilityLabel="Return to lessons"
          accessibilityRole="button"
          className="mr-3 h-11 w-11 items-center justify-center active:opacity-70"
          onPress={() => router.replace("/(tabs)/learn")}
        >
          <Ionicons color="#0D132B" name="chevron-back" size={32} />
        </Pressable>

        <View className="flex-1">
          <Text className="font-poppins-semibold text-[25px] leading-8 text-text-primary">
            AI Teacher
          </Text>
          <View className="mt-0.5 flex-row items-center">
            <View className="mr-2 h-3 w-3 rounded-full bg-[#22c632]" />
            <Text className="font-poppins text-[15px] text-[#68748e]">
              Online · {language.name}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <View className="h-12 w-12 items-center justify-center rounded-full border border-[#e7e9f1] bg-[#fbfbfd]">
            <Ionicons color="#0D132B" name="videocam-outline" size={24} />
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full border border-[#e7e9f1] bg-[#fbfbfd]">
            <Text className="font-poppins-medium text-[20px] text-text-primary">12</Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full border border-[#e7e9f1] bg-[#fbfbfd]">
            <Ionicons color="#0D132B" name="notifications-outline" size={23} />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 22 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-4 mt-5 h-[432px] overflow-hidden rounded-[30px] bg-[#e7e0dc]">
          <View className="absolute inset-0 bg-[#d7d0ca]" />
          <View className="absolute -right-10 top-20 h-48 w-48 rounded-full bg-[#c8c2bd] opacity-60" />
          <View className="absolute -left-8 bottom-0 h-44 w-44 rounded-full bg-[#eee4d9]" />
          <View className="absolute inset-0 items-center justify-center pb-12">
            <Image
              source={images.mascotWelcome}
              className="h-[365px] w-[365px]"
              resizeMode="contain"
            />
          </View>

          <View className="absolute bottom-5 left-5 right-5 rounded-[25px] bg-white px-5 py-4 shadow-sm">
            <View className="flex-row items-start">
              <View className="flex-1 pr-3">
                <Text className="font-poppins-semibold text-[21px] leading-7 text-text-primary">
                  {featuredPhrase.text}
                </Text>
                <Text className="mt-1 font-poppins text-[16px] leading-6 text-text-primary">
                  {featuredPhrase.translation}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Replay teacher phrase"
                accessibilityRole="button"
                className="mt-2 h-10 w-10 items-center justify-center rounded-full bg-[#f3f0ff] active:opacity-70"
              >
                <Ionicons color="#6C4EF5" name="volume-high" size={25} />
              </Pressable>
            </View>
            <Text className="mt-2 font-poppins-medium text-[12px] text-[#6C4EF5]">
              Your teacher is ready when you are.
            </Text>
          </View>
        </View>

        <View className="mt-5 bg-[#fbfaff] px-5 pb-4 pt-2">
          <View className="flex-row justify-between">
            <AudioControl icon="videocam-outline" label="Camera" muted />
            <AudioControl
              icon={isListening ? "mic" : "mic-outline"}
              label={isListening ? "Listening" : "Mic"}
              active={isListening}
              onPress={() => setIsListening((value) => !value)}
            />
            <AudioControl
              icon="language-outline"
              label="Subtitles"
              onPress={() => setShowLessonDetails(true)}
            />
            <AudioControl
              endCall
              icon="call"
              label="End Call"
              onPress={() => router.replace("/(tabs)/learn")}
            />
          </View>

          <View className="mt-7 flex-row overflow-hidden rounded-[30px] bg-white py-7 shadow-sm">
            <FeedbackItem label="Speaking" value="Excellent" valueColor="text-[#22c632]" />
            <FeedbackItem label="Pronunciation" value="Great" valueColor="text-[#287aff]" bordered />
            <FeedbackItem label="Grammar" value="Good" valueColor="text-[#6C4EF5]" bordered />
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setShowLessonDetails(false)}
        transparent
        visible={showLessonDetails}
      >
        <View className="flex-1 justify-end bg-[#0D132B]/35">
          <Pressable
            accessibilityLabel="Close lesson details"
            className="absolute inset-0"
            onPress={() => setShowLessonDetails(false)}
          />
          <View className="max-h-[78%] rounded-t-[32px] bg-white px-6 pb-8 pt-5">
            <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-[#d8dce7]" />
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="h3 text-text-primary">{lesson.title}</Text>
                <Text className="mt-1 body-medium text-text-secondary">{language.name} audio lesson</Text>
              </View>
              <Pressable
                accessibilityLabel="Close subtitles"
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f8]"
                onPress={() => setShowLessonDetails(false)}
              >
                <Ionicons color="#0D132B" name="close" size={22} />
              </Pressable>
            </View>

            <Text className="mt-5 font-poppins-semibold text-[15px] text-text-primary">Today’s goal</Text>
            <Text className="mt-1 body-medium text-text-secondary">{lesson.goal}</Text>

            <Text className="mt-5 font-poppins-semibold text-[15px] text-text-primary">Phrases</Text>
            <View className="mt-2 gap-2">
              {lesson.phrases.map((phrase) => (
                <View key={phrase.text} className="rounded-2xl bg-[#f6f3ff] px-4 py-3">
                  <Text className="font-poppins-semibold text-[15px] text-text-primary">{phrase.text}</Text>
                  <Text className="mt-0.5 font-poppins text-[13px] text-text-secondary">
                    {phrase.translation}
                  </Text>
                </View>
              ))}
            </View>

            <Text className="mt-5 font-poppins-semibold text-[15px] text-text-primary">Teacher context</Text>
            <Text className="mt-1 body-small text-text-secondary">{lesson.aiTeacherPrompt}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type AudioControlProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  endCall?: boolean;
  muted?: boolean;
  onPress?: () => void;
};

function AudioControl({ icon, label, active = false, endCall = false, muted = false, onPress }: AudioControlProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: muted, selected: active }}
      className="flex-1 items-center active:opacity-70"
      disabled={muted}
      onPress={onPress}
    >
      <View
        className={`h-[78px] w-[78px] items-center justify-center rounded-full border-2 ${
          endCall
            ? "border-[#ff343b] bg-[#ff343b]"
            : active
              ? "border-[#6C4EF5] bg-[#eee9ff]"
              : "border-[#e4e7ef] bg-white"
        }`}
      >
        <Ionicons color={endCall ? "#FFFFFF" : muted ? "#8993aa" : "#0D2454"} name={icon} size={34} />
      </View>
      <Text className={`mt-3 font-poppins-medium text-[16px] ${muted ? "text-[#9ba3b5]" : "text-[#68748e]"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

type FeedbackItemProps = {
  label: string;
  value: string;
  valueColor: string;
  bordered?: boolean;
};

function FeedbackItem({ label, value, valueColor, bordered = false }: FeedbackItemProps) {
  return (
    <View className={`flex-1 items-center ${bordered ? "border-l border-[#e8eaf1]" : ""}`}>
      <Text
        className="font-poppins-medium text-[16px] text-text-primary"
        numberOfLines={1}
        style={Platform.OS === "android" ? { fontSize: 14 } : undefined}
      >
        {label}
      </Text>
      <Text className={`mt-3 font-poppins-semibold text-[20px] ${valueColor}`}>{value}</Text>
    </View>
  );
}
