import React, { useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
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

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    Animated.timing(rotation, {
      toValue: next ? 0 : 1,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View className="w-full">
      {/* Header */}
      <View className="flex-row items-center mb-2.5">
        <Text className="flex-1 text-2xl font-bold text-[#11181C]">
          {title}
        </Text>

        <Pressable
          onPress={toggle}
          hitSlop={8}
          className="w-[38px] h-[38px] rounded-full bg-[#DCFCE7] items-center justify-center"
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <ChevronUpIcon size={18} color="#22C55E" />
          </Animated.View>
        </Pressable>
      </View>

      {/* Collapsible Body */}
      {expanded && (
        <View className="bg-white border border-gray-200 rounded-2xl p-2">
          <MenuList items={items} onToggle={onToggleItem} />
        </View>
      )}
    </View>
  );
}
