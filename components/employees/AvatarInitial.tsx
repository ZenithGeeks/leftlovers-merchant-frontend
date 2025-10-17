import React from 'react';
import { Text, View } from 'react-native';

export default function AvatarInitial({ name }: { name: string }) {
  const letter = name?.trim()?.[0]?.toUpperCase() ?? '?';
  return (
    <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center">
      <Text className="text-base font-semibold text-[#11181C]">{letter}</Text>
    </View>
  );
}
