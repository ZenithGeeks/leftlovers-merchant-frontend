import { Fonts } from "@/constants/theme";
import React, { useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronUpIcon } from "react-native-heroicons/solid";
import MenuList, { MenuItem } from "./Menu-List";

type Props = {
  title?: string;
  items: MenuItem[];
  defaultExpanded?: boolean;
  onToggleItem?: (id: string, value: boolean) => void;
};

export default function MenuWrapper({
  title = "Food",
  items,
  defaultExpanded = true,
  onToggleItem,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = new Animated.Value(expanded ? 0 : 1);
  const rotateTo = (open: boolean) => {
    Animated.timing(rotation, {
      toValue: open ? 0 : 1,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    rotateTo(next);
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>

        <Pressable onPress={toggle} style={styles.chevronBtn} hitSlop={8}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <ChevronUpIcon size={18} color="#22C55E" />
          </Animated.View>
        </Pressable>
      </View>

      {/* Body (collapsible) */}
      {expanded && (
        <View style={styles.body}>
          <MenuList items={items} onToggle={onToggleItem} />
        </View>
      )}
    </View>
  );
}

const RADIUS = 16;

const styles = StyleSheet.create({
  section: {
    width: "100%",
    height  : "auto",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: "#11181C",
  },
  chevronBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: RADIUS,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
