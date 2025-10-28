import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function EmployeesHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="flex-row items-end justify-between mb-2">
      <View>
        <Text className="text-lg font-bold text-[#11181C]">Your employees</Text>
        <Text className="text-sm text-[#6B7280] mt-1">Manage what others can access</Text>
      </View>

      <TouchableOpacity onPress={onAdd} hitSlop={8}>
        <Text className="text-[18px] font-bold text-[#26BD68]">+ Add</Text>
      </TouchableOpacity>
    </View>
  );
}
