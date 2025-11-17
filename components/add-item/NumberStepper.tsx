import React from "react";
import { Pressable, Text, View } from "react-native";

export default function NumberStepper({
  value,
  onChange,
  testID,
}: { value: number; onChange: (v: number) => void; testID: string }) {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(value + 1);

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="stepper-decrement"
        testID={testID+"-stepper-decrement"}
        onPress={dec}
        disabled={value <= 0}
        className={`w-8 h-8 rounded-lg items-center justify-center ${value <= 0 ? "bg-gray-200" : "bg-emerald-500"}`}
      >
        <Text className="text-white text-[16px] font-bold">−</Text>
      </Pressable>

      <View className="h-8 min-w-[44px] px-3 rounded-lg bg-gray-100 items-center justify-center">
        <Text accessibilityLabel="stepper-value" testID="stepper-value" className="text-[#11181C] font-semibold">{value}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="stepper-increment"
        testID={testID+"-stepper-increment"}
        onPress={inc}
        className="w-8 h-8 rounded-lg items-center justify-center bg-emerald-500"
      >
        <Text className="text-white text-[16px] font-bold">+</Text>
      </Pressable>
    </View>
  );
}
