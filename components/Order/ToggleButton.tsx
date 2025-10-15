import React from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { ChevronUpIcon } from "react-native-heroicons/solid";

type ToggleButtonProps = {
  expanded: boolean;
  onToggle: () => void;
};

export default function ToggleButton({
  expanded,
  onToggle,
}: ToggleButtonProps) {
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
    rotateTo(next);
    onToggle();
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.section}>
        <Pressable onPress={toggle} style={styles.chevronBtn} hitSlop={8}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <ChevronUpIcon size={18} color="#22C55E" />
          </Animated.View>
        </Pressable>
   </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "auto",
    height  : "auto",
  },
  chevronBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
});
