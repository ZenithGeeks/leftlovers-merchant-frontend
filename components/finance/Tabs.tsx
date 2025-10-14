import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TabKey } from './types';
import { financeStyles as s } from './styles';

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export default function Tabs({ active, onChange }: Props) {
  const tabs: TabKey[] = ['Summary', 'Transaction', 'Payout'];
  return (
    <View style={s.tabContainer}>
      {tabs.map((label) => (
        <TouchableOpacity key={label} onPress={() => onChange(label)}>
          <Text style={[s.tabText, active === label && s.activeTab]}>{label}</Text>
          {active === label && <View style={s.activeLine} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
