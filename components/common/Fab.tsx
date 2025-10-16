import React from "react";
import { Pressable, View } from "react-native";
import { PlusIcon } from "react-native-heroicons/solid";

type Props = {
  onPress?: () => void;
  testID?: string;
};

export default function Fab({ onPress, testID }: Props) {
  return (
    <View className="absolute right-5 bottom-6">
      <Pressable
        testID={testID ?? "fab-add"}
        onPress={onPress}
        className="h-16 w-16 items-center justify-center rounded-full bg-green-500"
        android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
      >
        <PlusIcon size={28} color="#fff" />
      </Pressable>
    </View>
  );
}
