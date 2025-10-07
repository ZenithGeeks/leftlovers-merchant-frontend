import { Colors, Fonts } from "@/constants/theme";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    LayoutChangeEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Tab = { key: string; label: string };

type Props = {
  tabs: Tab[];                 
  value: string;               // active key
  onChange: (key: string) => void;
  size?: "sm" | "md";
  underlineColor?: string;     // default: brand accent
  textActiveColor?: string;    // default: brand accent
  textInactiveColor?: string;  // default: dark text
};

export default function ContentSwitcher({
  tabs,
  value,
  onChange,
  size = "md",
  underlineColor = Colors.light.accent ?? "#26BD68",
  textActiveColor = Colors.light.accent ?? "#26BD68",
  textInactiveColor = "#11181C",
}: Props) {
  const [width, setWidth] = useState(0);
  const index = useMemo(
    () => Math.max(0, tabs.findIndex(t => t.key === value)),
    [tabs, value]
  );
  const indicatorX = useRef(new Animated.Value(0)).current;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  useEffect(() => {
    if (width <= 0 || tabs.length === 0) return;
    const segment = width / tabs.length;
    Animated.spring(indicatorX, {
      toValue: index * segment,
      useNativeDriver: true,
      stiffness: 180,
      damping: 18,
      mass: 0.6,
    }).start();
  }, [index, width, tabs.length, indicatorX]);

  const S = styles(size);
  const segmentWidth = width / Math.max(1, tabs.length);

  return (
    <View onLayout={onLayout} style={S.container}>
      {/* Labels row */}
      <View style={S.row}>
        {tabs.map((tab, i) => {
          const active = tab.key === value;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={({ pressed }) => [
                S.tab,
                { width: `${100 / tabs.length}%` },
                pressed && S.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  S.label,
                  {
                    color: active ? textActiveColor : textInactiveColor,
                    fontFamily: active ? Fonts.bold : Fonts.medium,
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Base hairline */}
      <View style={S.hairline} />

      {/* Sliding underline */}
      <Animated.View
        style={[
          S.underline,
          {
            width: segmentWidth,
            backgroundColor: underlineColor,
            transform: [{ translateX: indicatorX }],
          },
        ]}
      />
    </View>
  );
}

function styles(size: "sm" | "md") {
  const padY = size === "sm" ? 8 : 10;
  const fontSize = size === "sm" ? 14 : 16;
  return StyleSheet.create({
    container: {
      width: "100%",
      position: "relative",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    tab: {
      alignItems: "center",
      paddingVertical: padY,
    },
    label: {
      fontSize,
    },
    hairline: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: "#D1D5DB",
      width: "100%",
    },
    underline: {
      position: "absolute",
      height: 2.5,
      bottom: -1,
      left: 0,
      borderRadius: 999,
    },
    pressed: { opacity: 0.7 },
  });
}
