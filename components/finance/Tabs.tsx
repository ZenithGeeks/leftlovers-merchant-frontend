import { Text, TouchableOpacity, View } from 'react-native';
import type { TabKey } from './types';

export default function Tabs({ active, onChange }: { active: TabKey; onChange: (v: TabKey) => void }) {
  const tabs: TabKey[] = ['Summary', 'Transaction', 'Payout'];
  return (
    <View className="flex-row mb-4 gap-8">
      {tabs.map((tab) => (
        <TouchableOpacity key={tab} onPress={() => onChange(tab)}>
          <Text
            className={`text-base ${
              active === tab ? 'text-green-600 font-bold' : 'text-gray-400 font-medium'
            }`}
          >
            {tab}
          </Text>
          {active === tab && <View className="h-0.5 bg-green-600 mt-1" />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
