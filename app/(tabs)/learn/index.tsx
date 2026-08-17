import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function LearnScreen() {
  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <Text className="h2 text-text-primary">Learn</Text>
      <Text className="mt-2 body-medium text-text-secondary">Choose a lesson to begin.</Text>
      <Link href={{ pathname: "/(tabs)/learn/[id]", params: { id: "1" } }} asChild>
        <Pressable
          accessibilityRole="button"
          className="mt-8 rounded-3xl bg-surface p-5 active:opacity-80"
        >
          <Text className="h4 text-text-primary">Lesson 1</Text>
          <Text className="mt-1 body-small text-text-secondary">At the cafe</Text>
        </Pressable>
      </Link>
    </View>
  );
}
