import type { MenuItemAPI } from "@/types/types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { ChevronUpIcon } from "react-native-heroicons/solid";
import MenuList from "./Menu-List";

type Props = {
  title?: string;
  items: MenuItemAPI[];
  defaultExpanded?: boolean;
  merchantId: string;
  onToggleItem?: (id: string, value: boolean) => void;
  onAfterChange?: () => void;
};

export default function MenuWrapper({
  title = "Food",
  items,
  defaultExpanded = true,
  onToggleItem,
  onAfterChange,
  merchantId,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const rotation = useRef(new Animated.Value(defaultExpanded ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? 0 : 1,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [expanded, rotation]);

  const rotate = useMemo(
    () =>
      rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [rotation]
  );

  const toggle = () => setExpanded((p) => !p);

  return (
    <View className="w-full">
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

      {expanded && (
        <View className="bg-white border border-gray-200 rounded-2xl p-2">
          <MenuList
            items={items}
            merchantId={merchantId}
            onToggle={(id, value) => {
              onToggleItem?.(id, value);
              onAfterChange?.();
            }}
            onDelete={() => {
              onAfterChange?.();
            }}
          />
        </View>
      )}
    </View>
  );
}
