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
  value: string;
  onChange: (key: string) => void;
  size?: "sm" | "md";
  underlineColor?: string;
  textActiveColor?: string;
  textInactiveColor?: string;
  animated?: boolean;
  containerWidth?: number;
  testID?: string;
};

export default function ContentSwitcher({
  tabs,
  value,
  onChange,
  size = "md",
  underlineColor = Colors.light.accent ?? "#26BD68",
  textActiveColor = Colors.light.accent ?? "#26BD68",
  textInactiveColor = "#11181C",
  animated = true,
  containerWidth,
  testID = "content-switcher",
}: Props) {
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const width = containerWidth ?? measuredWidth;

  const index = useMemo(
    () => Math.max(0, tabs.findIndex((t) => t.key === value)),
    [tabs, value]
  );

  const onLayout = (e: LayoutChangeEvent) => {
    if (containerWidth != null) return;
    setMeasuredWidth(e.nativeEvent.layout.width);
  };
  const indicatorX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    if (width <= 0 || tabs.length === 0) return;
    const segment = width / tabs.length;

    Animated.spring(indicatorX, {
      toValue: index * segment,
      useNativeDriver: true,
      stiffness: 180,
      damping: 18,
      mass: 0.6,
    }).start();
  }, [animated, index, width, tabs.length, indicatorX]);

  const S = styles(size);
  const segmentWidth = width > 0 ? width / Math.max(1, tabs.length) : undefined;
  const staticLeft = segmentWidth != null ? index * segmentWidth : 0;

  return (
    <View
      onLayout={onLayout}
      style={S.container}
      testID={testID}
      accessibilityRole="tablist"
    >
      {/* Row of tabs */}
      <View style={S.row}>
        {tabs.map((tab) => {
          const active = tab.key === value;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${tab.label}-tab`}
              testID={`${testID}-tab-${tab.key}`}
              onPress={() => onChange(tab.key)}
              style={[S.tab, { width: `${100 / tabs.length}%` }]}
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

      {/* Underline: animated or static for tests */}
      {animated ? (
        <Animated.View
          testID={`${testID}-underline`}
          style={[
            S.underline,
            {
              width: segmentWidth,
              backgroundColor: underlineColor,
              transform: [{ translateX: indicatorX }],
            },
          ]}
        />
      ) : (
        <View
          testID={`${testID}-underline`}
          style={[
            S.underline,
            {
              width: segmentWidth,
              backgroundColor: underlineColor,
              left: staticLeft,
            },
          ]}
        />
      )}
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
  });
}