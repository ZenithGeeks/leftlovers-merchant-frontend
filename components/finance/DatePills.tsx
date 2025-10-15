import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { DateKey } from '@/components/finance/types';
import { financeStyles as s } from '@/components/finance/styles';

type Props = {
  value: DateKey;
  onChange: (v: DateKey) => void;
};

export default function DatePills({ value, onChange }: Props) {
  const options: DateKey[] = ['Today', 'Yesterday', 'This week', 'This month'];
  return (
    <View style={s.dateFilter}>
      {options.map((label) => (
        <TouchableOpacity
          key={label}
          style={[s.dateButton, value === label ? s.dateButtonActive : s.dateButtonInactive]}
          onPress={() => onChange(label)}
        >
          <Text style={[s.dateButtonText, value === label ? s.dateTextActive : s.dateTextInactive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
