import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { ChevronUpIcon } from "react-native-heroicons/solid";

type ToggleButtonProps = {
  expanded: boolean;
  onToggle: () => void;
};

export default function ToggleButton({ expanded, onToggle }: ToggleButtonProps) {
  // 0 = collapsed, 1 = expanded
  const rotation = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  const animateTo = useCallback(
    (open: boolean) => {
      Animated.timing(rotation, {
        toValue: open ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [rotation]
  );

  // sync animation whenever parent state changes
  useEffect(() => {
    animateTo(expanded);
  }, [expanded, animateTo]);

  const toggle = () => {
    onToggle(); // parent will update expanded -> triggers useEffect animation
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.section}>
      <Pressable onPress={toggle} style={styles.chevronBtn} hitSlop={8}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronUpIcon size={16} color="#22C55E" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "auto",
    height: "auto",
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
