import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { VerificationModal } from "@/components/verification-modal";

type AuthMode = "sign-in" | "sign-up";

type AuthScreenProps = {
  mode: AuthMode;
};

const content = {
  "sign-in": {
    action: "Sign In",
    alternateAction: "Sign up",
    alternatePrefix: "Don't have an account?",
    heading: "Welcome back!",
    subtitle: "Continue your language journey",
  },
  "sign-up": {
    action: "Sign Up",
    alternateAction: "Log in",
    alternatePrefix: "Already have an account?",
    heading: "Create your account",
    subtitle: "Start your language journey today ✨",
  },
} as const;

const socialStrategies = {
  apple: "oauth_apple",
  facebook: "oauth_facebook",
  google: "oauth_google",
} as const;

export function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { signUp, fetchStatus: signUpStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const copy = content[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);

  const alternateRoute = mode === "sign-up" ? "/(auth)/sign-in" : "/(auth)/sign-up";
  const isLoading = signInStatus === "fetching" || signUpStatus === "fetching";

  const navigateAfterAuth = ({
    session,
    decorateUrl,
  }: Parameters<
    NonNullable<NonNullable<Parameters<typeof signIn.finalize>[0]>["navigate"]>
  >[0]) => {
    if (session?.currentTask) {
      Alert.alert("Account setup required", "Please complete the remaining account setup task.");
      return;
    }

    const url = decorateUrl("/");
    if (url.startsWith("http") && typeof window !== "undefined") {
      window.location.href = url;
      return;
    }

    router.replace(url as Href);
  };

  const showClerkError = (error: { longMessage?: string; message: string }) => {
    Alert.alert("Authentication failed", error.longMessage ?? error.message);
  };

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert("Email required", "Enter your email address to continue.");
      return;
    }

    if (mode === "sign-up") {
      if (!password) {
        Alert.alert("Password required", "Enter a password to create your account.");
        return;
      }

      const { error } = await signUp.password({ emailAddress: normalizedEmail, password });
      if (error) {
        showClerkError(error);
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        showClerkError(sendError);
        return;
      }
    } else {
      const { error } = await signIn.emailCode.sendCode({ emailAddress: normalizedEmail });
      if (error) {
        showClerkError(error);
        return;
      }
    }

    setEmail(normalizedEmail);
    setIsVerificationVisible(true);
  };

  const handleVerify = async (code: string) => {
    if (mode === "sign-up") {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        showClerkError(error);
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize({ navigate: navigateAfterAuth });
      }
      return;
    }

    const { error } = await signIn.emailCode.verifyCode({ code });
    if (error) {
      showClerkError(error);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: navigateAfterAuth });
    }
  };

  const handleSocialAuth = async (provider: SocialProvider) => {
    try {
      const { createdSessionId, setActive, signUp: socialSignUp } = await startSSOFlow({
        strategy: socialStrategies[provider],
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
      } else if (socialSignUp?.status === "missing_requirements") {
        Alert.alert("More information required", "Complete the missing account details in Clerk.");
      }
    } catch {
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
      Alert.alert(`${providerName} sign-in failed`, "Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
      <View className="min-h-full px-11 pt-5">
        <Pressable
          accessibilityLabel="Go back"
          className="h-11 w-11 items-start justify-center active:opacity-60"
          onPress={() => router.back()}
        >
          <Ionicons color="#0D132B" name="chevron-back" size={34} />
        </Pressable>

        <View className="mt-9">
          <Text className="font-poppins-semibold text-[36px] leading-[45px] tracking-[-1.1px] text-text-primary">
            {copy.heading}
          </Text>
          <Text className="mt-3 font-poppins text-[18px] text-[#6A7187]">{copy.subtitle}</Text>
        </View>

        <View className="mt-4 h-[183px] items-center justify-end overflow-visible">
          <Image
            source={images.mascotAuth}
            className="h-[228px] w-[285px]"
            resizeMode="contain"
          />
        </View>

        <View className="mt-2 gap-4">
          <View className="h-[112px] rounded-[22px] border border-[#E7E8EF] px-6 pt-4">
            <Text className="font-poppins-medium text-[16px] text-[#7E869C]">Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="alex@gmail.com"
              placeholderTextColor="#0D132B"
              value={email}
              className="mt-1 p-0 font-poppins text-[20px] text-text-primary"
            />
          </View>

          {mode === "sign-up" && (
            <View className="h-[104px] rounded-[22px] border border-[#E7E8EF] px-6 pt-4">
              <Text className="font-poppins-medium text-[16px] text-[#7E869C]">Password</Text>
              <View className="flex-row items-center">
                <TextInput
                  autoComplete="new-password"
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  value={password}
                  className="mt-1 flex-1 p-0 font-poppins text-[20px] text-text-primary"
                />
                <Pressable
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  className="h-10 w-10 items-end justify-center"
                  onPress={() => setShowPassword((current) => !current)}
                >
                  <Ionicons
                    color="#68718C"
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={29}
                  />
                </Pressable>
              </View>
            </View>
          )}

          <Pressable
            className="mt-2 h-[82px] items-center justify-center rounded-[21px] bg-lingua-purple active:opacity-90"
            disabled={isLoading}
            onPress={() => void handleSubmit()}
          >
            <Text className="font-poppins-semibold text-[25px] text-white">{copy.action}</Text>
          </Pressable>
        </View>

        <View className="mt-9 flex-row items-center gap-4">
          <View className="h-px flex-1 bg-[#E7E8EF]" />
          <Text className="font-poppins text-[16px] text-[#6A7187]">or continue with</Text>
          <View className="h-px flex-1 bg-[#E7E8EF]" />
        </View>

        <View className="mt-6 gap-3">
          <SocialButton icon="google" label="Continue with Google" onPress={handleSocialAuth} />
          <SocialButton icon="facebook" label="Continue with Facebook" onPress={handleSocialAuth} />
          <SocialButton icon="apple" label="Continue with Apple" onPress={handleSocialAuth} />
        </View>

        <View className="mt-auto flex-row justify-center pb-7 pt-5">
          <Text className="font-poppins text-[16px] text-[#6A7187]">{copy.alternatePrefix} </Text>
          <Pressable onPress={() => router.replace(alternateRoute)}>
            <Text className="font-poppins-medium text-[16px] text-lingua-purple">{copy.alternateAction}</Text>
          </Pressable>
        </View>
      </View>
      </ScrollView>

      {mode === "sign-up" && <View nativeID="clerk-captcha" />}
      <VerificationModal
        email={email}
        isLoading={isLoading}
        onRequestClose={() => setIsVerificationVisible(false)}
        onVerify={handleVerify}
        visible={isVerificationVisible}
      />
    </SafeAreaView>
  );
}

type SocialProvider = "apple" | "facebook" | "google";

type SocialButtonProps = {
  icon: SocialProvider;
  label: string;
  onPress: (provider: SocialProvider) => Promise<void>;
};

function SocialButton({ icon, label, onPress }: SocialButtonProps) {
  const socialIconColors = {
    apple: "#0D132B",
    facebook: "#1877F2",
    google: "#EA4335",
  } as const;

  return (
    <Pressable
      className="h-[76px] flex-row items-center rounded-[22px] border border-[#E7E8EF] px-12 active:bg-surface"
      onPress={() => void onPress(icon)}
    >
      <FontAwesome color={socialIconColors[icon]} name={icon} size={33} />
      <Text className="ml-11 font-poppins-medium text-[19px] text-text-primary">{label}</Text>
    </Pressable>
  );
}
