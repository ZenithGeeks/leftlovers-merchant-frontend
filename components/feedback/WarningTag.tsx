import React from "react";
import { Text, View } from "react-native";

type Props = {
  label: string;
};

export default function WarningTag({ label }: Props) {
  return (
    <View className="px-2.5 py-1 rounded-full bg-white border border-amber-200">
      <Text className="text-[12px] text-amber-700 font-medium">{label}</Text>
    </View>
  );
}
