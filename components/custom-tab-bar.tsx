import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE_CIRCLE_SIZE = 58;

const tabIcons = {
  index: "home-outline",
  learn: "book-outline",
  "ai-teacher": "sparkles-outline",
  chat: "chatbubble-outline",
  profile: "person-outline",
} as const;

type TabRouteName = keyof typeof tabIcons;

function getTabIcon(routeName: string, isActive: boolean): keyof typeof Ionicons.glyphMap {
  const iconName = tabIcons[routeName as TabRouteName];

  if (routeName === "index") {
    return isActive ? "home" : "home-outline";
  }

  return iconName;
}

export function CustomTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [tabRowLayout, setTabRowLayout] = useState({ width: 0, x: 0 });
  const indicatorLeft = useSharedValue(0);

  const activeRouteIndex = state.index;
  const tabWidth = tabRowLayout.width / state.routes.length;

  useEffect(() => {
    if (!tabWidth) {
      return;
    }

    indicatorLeft.value = withTiming(
      tabRowLayout.x + activeRouteIndex * tabWidth + (tabWidth - ACTIVE_CIRCLE_SIZE) / 2,
      { duration: 220, easing: Easing.linear },
    );
  }, [activeRouteIndex, indicatorLeft, tabRowLayout.x, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: indicatorLeft.value,
  }));

  return (
    <View
      className="border-t border-border bg-white px-2 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <Animated.View
        pointerEvents="none"
        className="absolute top-2 h-[58px] w-[58px] rounded-full bg-lingua-purple"
        style={indicatorStyle}
      />
      <View
        className="flex-row"
        onLayout={(event) => {
          const { width, x } = event.nativeEvent.layout;
          setTabRowLayout({ width, x });
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isActive = state.index === index;
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title ?? route.name;

          const handlePress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className="h-[66px] flex-1 items-center justify-center"
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              onPress={handlePress}
            >
              <Ionicons
                color={isActive ? "#FFFFFF" : "#6B7280"}
                name={getTabIcon(route.name, isActive)}
                size={25}
              />
              {!isActive && (
                <Text className="mt-1 font-poppins-medium text-[11px] leading-4 text-text-secondary">
                  {label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
