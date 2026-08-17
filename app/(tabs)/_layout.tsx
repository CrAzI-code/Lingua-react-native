import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomTabBar } from "@/components/custom-tab-bar";

export default function TabsLayout() {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Tabs
        initialRouteName="index"
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="learn" options={{ title: "Learn" }} />
        <Tabs.Screen name="ai-teacher" options={{ title: "AI Teacher" }} />
        <Tabs.Screen name="chat" options={{ title: "Chat" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </SafeAreaView>
  );
}
