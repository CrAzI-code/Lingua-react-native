import { useAuth } from "@clerk/expo";
import { Link, Redirect } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { LANGUAGE_SELECTION_ROUTE } from "@/constants/routes";

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
      <Link href={LANGUAGE_SELECTION_ROUTE} asChild>
        <Pressable
          accessibilityRole="button"
          className="mt-6 rounded-2xl border border-lingua-purple px-8 py-4 active:opacity-90"
        >
          <Text className="font-poppins-semibold text-[18px] text-lingua-purple">
            Choose a language
          </Text>
        </Pressable>
      </Link>
      <Pressable
        accessibilityRole="button"
        className="mt-4 rounded-2xl bg-lingua-purple px-8 py-4 active:opacity-90"
        onPress={() => void signOut()}
      >
        <Text className="font-poppins-semibold text-[18px] text-white">Sign out</Text>
      </Pressable>
    </View>
  );
}
