import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn, signOut } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="h1 text-center text-lingua-purple">Lingua</Text>
      <Pressable
        accessibilityRole="button"
        className="mt-6 rounded-2xl bg-lingua-purple px-8 py-4 active:opacity-90"
        onPress={() => void signOut()}
      >
        <Text className="font-poppins-semibold text-[18px] text-white">Sign out</Text>
      </Pressable>
    </View>
  );
}
