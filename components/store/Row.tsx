// components/store/Row.tsx
import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronRightIcon } from "react-native-heroicons/outline";

type RowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightSlot?: React.ReactNode;
};

export default function Row({
  icon,
  title,
  subtitle,
  onPress,
  rightSlot,
}: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center py-4 active:bg-gray-50"
      accessibilityRole={onPress ? "button" : undefined}
    >
      <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[16px] font-semibold text-[#11181C]">
          {title}
        </Text>
        {!!subtitle && (
          <Text className="text-[13px] text-gray-500 mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      <View className="ml-2">
        {rightSlot ??
          (onPress ? <ChevronRightIcon size={20} color="#11181C" /> : null)}
      </View>
    </Pressable>
  );
}
