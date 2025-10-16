import { View, Text } from 'react-native';
import { DatePills } from './DatePills';
import type { DateKey, Transaction } from './types';

export function TransactionTab({
  date,
  onDateChange,
  data,
}: {
  date: DateKey;
  onDateChange: (v: DateKey) => void;
  data: Transaction[];
}) {
  return (
    <View>
      <DatePills value={date} onChange={onDateChange} />
      {data.map((tx) => (
        <View key={tx.id} className="mt-3">
          <Text className="text-gray-900 font-bold mb-1">{tx.date}</Text>
          <View className="flex-row justify-between items-start bg-white rounded-xl border border-gray-200 p-4">
            <View>
              <Text className="text-gray-900 font-semibold">{tx.title}</Text>
              <Text className="text-gray-500 text-xs">
                Transaction ID {tx.id}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-black font-bold">
                {tx.amountTHB.toFixed(2)} THB
              </Text>
              <Text className="text-gray-500 text-xs">{tx.time}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
