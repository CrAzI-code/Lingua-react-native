import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { posthog } from "../config/posthog";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env file");
}

function PostHogIdentity() {
  const { isLoaded: isAuthLoaded, isSignedIn, userId } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!isSignedIn || !userId) {
      if (identifiedUserId.current !== null) {
        posthog?.reset();
        identifiedUserId.current = null;
      }
      return;
    }

    if (!isUserLoaded || identifiedUserId.current === userId) {
      return;
    }

    if (identifiedUserId.current) {
      posthog?.reset();
    }

    posthog?.identify(userId, {
      $set: {
        ...(user?.primaryEmailAddress?.emailAddress
          ? { email: user.primaryEmailAddress.emailAddress }
          : {}),
        ...(user?.firstName ? { first_name: user.firstName } : {}),
        ...(user?.lastName ? { last_name: user.lastName } : {}),
        ...(user?.username ? { username: user.username } : {}),
      },
    });
    identifiedUserId.current = userId;
  }, [isAuthLoaded, isSignedIn, isUserLoaded, user, userId]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <SafeAreaProvider>
        {posthog ? (
          <PostHogProvider client={posthog}>
            <PostHogIdentity />
            <PostHogErrorBoundary>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
            </PostHogErrorBoundary>
          </PostHogProvider>
        ) : (
          <>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </>
        )}
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
