import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background px-6 pt-10">
      <Pressable
        accessibilityLabel="Back to Learn"
        accessibilityRole="button"
        className="self-start py-2 active:opacity-70"
        onPress={() => router.back()}
      >
        <Text className="font-poppins-medium text-[16px] text-lingua-purple">Back</Text>
      </Pressable>
      <Text className="mt-8 h2 text-text-primary">Lesson {id}</Text>
      <Text className="mt-2 body-medium text-text-secondary">Lesson detail coming soon.</Text>
    </View>
  );
}
