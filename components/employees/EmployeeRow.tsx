import type { Employee } from '@/types/employee';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import AvatarInitial from './AvatarInitial';
import RoleBadge from './RoleBadge';

export default function EmployeeRow({
  item,
  onPress,
}: {
  item: Employee;
  onPress: (emp: Employee) => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-4"
      onPress={() => onPress(item)}
    >
      <AvatarInitial name={item.firstName} />
      <View className="flex-1">
        <Text className="text-base font-bold text-[#11181C] mb-1">
          {item.firstName} {item.lastName}
        </Text>
        <RoleBadge role={item.role} />
      </View>
      <Ionicons name="chevron-forward" size={20} color="#11181C" />
    </TouchableOpacity>
  );
}
