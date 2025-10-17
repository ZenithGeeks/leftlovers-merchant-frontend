import React from 'react';
import { Text, View } from 'react-native';
import type { Role } from './types';

const map: Record<Role, { bg: string; text: string }> = {
  Owner:   { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  Manager: { bg: 'bg-blue-50',    text: 'text-blue-600' },
  Cashier: { bg: 'bg-purple-50',  text: 'text-purple-600' },
  Stock:   { bg: 'bg-amber-50',   text: 'text-amber-600' },
};

export default function RoleBadge({ role }: { role: Role }) {
  const s = map[role] ?? map.Manager;
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${s.bg}`}>
      <Text className={`text-xs font-bold ${s.text}`}>{role}</Text>
    </View>
  );
}
