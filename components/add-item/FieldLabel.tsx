import React from "react";
import { Text, View } from "react-native";

export default function FieldLabel({
  label,
  required,
  className,
}: { label: string; required?: boolean; className?: string }) {
  return (
    <View className={`flex-row items-center ${className ?? ""}`}>
      <Text accessibilityRole="text" className="text-[16px] font-semibold text-[#11181C]">
        {label}
      </Text>
      {required ? <Text className="ml-1 text-[#EF4444]">*</Text> : null}
    </View>
  );
}
