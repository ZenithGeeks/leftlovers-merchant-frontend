import React from 'react';
import { Text, View } from 'react-native';
import { empStyles as s } from './styles';
import type { Role } from './types';

export default function RoleBadge({ role }: { role: Role }) {
  return (
    <View style={s.badge}>
      <Text style={s.badgeText}>{role}</Text>
    </View>
  );
}
