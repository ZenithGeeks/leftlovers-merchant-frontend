import React from "react";
import { Pressable, Text, View } from "react-native";
import { ArrowUpTrayIcon } from "react-native-heroicons/outline";

export default function UploadBox({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="upload-box"
      className="w-full h-[92px] rounded-2xl border-2 border-dashed border-gray-400 bg-white px-4 py-3 flex-row items-center justify-between"
    >
      <Text className="text-[15px] text-[#6B7280]">Upload PNG/JPEG</Text>
      <View className="w-10 h-10 rounded-2xl items-center justify-center bg-gray-100">
        <ArrowUpTrayIcon size={20} color="#11181C" />
      </View>
    </Pressable>
  );
}
