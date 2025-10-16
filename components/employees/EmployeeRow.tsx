import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { empStyles as s } from './styles';
import AvatarInitial from './AvatarInitial';
import RoleBadge from './RoleBadge';
import type { Employee } from './types';

export default function EmployeeRow({ item, onPress }: { item: Employee; onPress: (e: Employee) => void }) {
  return (
    <Pressable style={s.rowItem} onPress={() => onPress(item)}>
      <AvatarInitial name={item.firstName} />
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{item.firstName} {item.lastName}</Text>
        <RoleBadge role={item.role} />
      </View>
      <Ionicons name="chevron-forward" size={20} color="#11181C" />
    </Pressable>
  );
}
