import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="h1 text-center text-lingua-purple">Lingua</Text>
      <Link
        href="/onboarding"
        className="body-md text-lingua-purple underline mt-4"
      >
        View onboarding
      </Link>
    </View>
  );
}
