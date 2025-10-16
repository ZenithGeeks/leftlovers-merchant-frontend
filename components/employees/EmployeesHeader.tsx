import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { empStyles as s } from './styles';

export default function EmployeesHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <View>
        <Text style={s.sectionTitle}>Your employees</Text>
        <Text style={s.sectionSub}>Manage what others can access</Text>
      </View>
      <TouchableOpacity onPress={onAdd} hitSlop={8}>
        <Text style={s.addText}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );
}
