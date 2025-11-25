import React from 'react';
import { Text, View } from 'react-native';
import type { Role } from '@/types/employee.ts';

const map: Record<Role, { bg: string; text: string }> = {
  Owner:   { bg: 'bg-[#26BD68]', text: 'text-white' },
  Manager: { bg: 'bg-[#26BD68]',    text: 'text-white' },
  Cashier: { bg: 'bg-[#26BD68]',  text: 'text-white' },
  Stock:   { bg: 'bg-[#26BD68]',   text: 'text-white' },
};

const defaultStyle = { bg: 'bg-gray-100', text: 'text-gray-800' };

export default function RoleBadge({ role }: { role: Role }) {
  const s = map[role] ?? defaultStyle;
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${s.bg}`}>
      <Text className={`text-xs font-bold ${s.text}`}>{role}</Text>
    </View>
  );
}
