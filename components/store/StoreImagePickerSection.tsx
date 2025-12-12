// components/store/StoreImagePickerSection.tsx
import React from "react";
import { Text, View } from "react-native";
import ImagePickerField from "@/components/ImagePickerField";

type StoreImagePickerSectionProps = {
  title: string;
  description: string;
  value: string | null;
  onChange: (uri: string | null) => void;
};

export default function StoreImagePickerSection({
  title,
  description,
  value,
  onChange,
}: StoreImagePickerSectionProps) {
  return (
    <View className="mt-8">
      <Text className="text-[18px] font-bold text-[#11181C] mb-2">
        {title}
      </Text>
      <Text className="text-[14px] text-[#6B7280] mb-3">{description}</Text>
      <ImagePickerField
        value={value ?? undefined}
        onChange={(val: any) => {
          if (!val) {
            onChange(null);
            return;
          }
          if (typeof val === "string") {
            onChange(val);
          } else if (typeof val === "object" && val.uri) {
            onChange(val.uri);
          } else {
            onChange(null);
          }
        }}
      />
    </View>
  );
}