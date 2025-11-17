import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronDownIcon } from "react-native-heroicons/outline";

export default function SelectBox({
  value,
  placeholder,
  onPress,
  a11yLabel,
}: { value?: string; placeholder: string; onPress: () => void; a11yLabel: string }) {
  return (
    <Pressable
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        testID={a11yLabel}
        onPress={onPress}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 flex-row items-center"
    >
      <Text className={value ? "text-[16px] text-[#11181C]" : "text-[16px] text-gray-400"}>
        {value ?? placeholder}
      </Text>
      <View className="ml-auto">
        <ChevronDownIcon size={18} color="#11181C" />
      </View>
    </Pressable>
  );
}
