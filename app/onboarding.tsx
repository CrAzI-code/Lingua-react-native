import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
      <View className="min-h-full px-10 pt-8">
        <View className="flex-row items-center justify-center gap-2">
          <Image
            source={images.mascotLogo}
            className="h-13 w-13"
            resizeMode="contain"
          />
          <Text className="font-poppins-semibold text-[32px] tracking-[-1.4px] text-text-primary">
            Lingua
          </Text>
        </View>

        <View className="mt-17">
          <Text className="font-poppins-semibold text-[38px] leading-[48px] tracking-[-1px] text-text-primary">
            Your AI language{"\n"}
            <Text className="text-lingua-purple">teacher.</Text>
          </Text>
          <Text className="mt-4 font-poppins text-[17px] leading-[31px] text-text-secondary">
            Real conversations, personalized{"\n"}
            lessons, anytime, anywhere.
          </Text>
        </View>

        <View className="relative mt-7 h-[430px]">
          <View className="absolute left-1 top-8 rotate-[-7deg] rounded-[23px] bg-[#EDF7FF] px-6 py-4">
            <Text className="font-poppins-medium text-[24px] text-text-primary">Hello!</Text>
            <View className="absolute -bottom-3 left-14 h-5 w-7 rotate-[24deg] bg-[#EDF7FF]" />
          </View>

          <View className="absolute right-0 top-0 rotate-[10deg] rounded-[23px] bg-[#F5F2FF] px-6 py-4">
            <Text className="font-poppins-medium text-[24px] text-lingua-purple">¡Hola!</Text>
            <View className="absolute -bottom-3 right-12 h-5 w-7 rotate-[-24deg] bg-[#F5F2FF]" />
          </View>

          <View className="absolute right-0 top-35 rotate-[10deg] rounded-[23px] bg-[#FFF3EE] px-6 py-4">
            <Text className="font-poppins-medium text-[24px] text-[#FF4D4F]">你好!</Text>
            <View className="absolute -bottom-3 right-12 h-5 w-7 rotate-[-24deg] bg-[#FFF3EE]" />
          </View>

          <Image
            source={images.mascotWelcome}
            className="absolute bottom-0 left-1/2 h-[382px] w-[382px] -translate-x-1/2"
            resizeMode="contain"
          />
        </View>

        <Pressable
          className="mb-7 mt-auto h-[72px] flex-row items-center justify-center rounded-[24px] bg-lingua-purple active:opacity-90"
          onPress={() => router.push("/(auth)/sign-up")}
        >
          <Text className="font-poppins-semibold text-[25px] text-white">Get Started</Text>
          <View className="absolute right-9">
            <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
