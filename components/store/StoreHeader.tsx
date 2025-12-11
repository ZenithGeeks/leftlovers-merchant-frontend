// components/store/StoreHeader.tsx
import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";

type StoreHeaderProps = {
  title: string;
  onBack: () => void;
};

export default function StoreHeader({ title, onBack }: StoreHeaderProps) {
  return (
    <View className="px-5 pb-2 flex-row items-center justify-between">
      <Pressable
        onPress={onBack}
        accessibilityLabel="back"
        className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
      >
        <ChevronLeftIcon size={18} color="#11181C" />
      </Pressable>
      <Text className="text-2xl font-bold text-[#11181C]">{title}</Text>
      {/* spacer to keep title centered */}
      <View className="w-9 h-9" />
    </View>
  );
}
