import { Text, TouchableOpacity, View } from 'react-native';
import type { TabKey } from './types';

export function Tabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const tabs: TabKey[] = ['Summary', 'Transaction', 'Payout'];
  return (
    <View className="flex-row items-center mb-3 gap-7">
      {tabs.map((tab) => (
        <TouchableOpacity key={tab} onPress={() => onChange(tab)}>
          <Text
            className={`text-base ${
              active === tab
                ? 'text-green-600 font-bold'
                : 'text-gray-500 font-medium'
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
