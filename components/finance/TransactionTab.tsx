import { View, Text } from 'react-native';
import { DatePills } from './DatePills';
import { filterByDateRange } from '@/utils/financeFilters';
import type { Transaction, DateKey } from './types';

export function TransactionTab({
  date,
  onDateChange,
  data,
}: {
  date: DateKey;
  onDateChange: (v: DateKey) => void;
  data: Transaction[];
}) {
  
  if (data.length === 0) {
    return (
      <View className="mt-4">
        <DatePills value={date} onChange={onDateChange} />
        <Text className="text-center text-gray-400 mt-4">
          No transactions found
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-2">
      <DatePills value={date} onChange={onDateChange} />
      {data.map((tx) => (
        <View
          key={tx.id}
          className="flex-row justify-between border-b border-gray-200 py-2"
        >
          <View>
            <Text className="font-semibold text-gray-900">{tx.title}</Text>
            <Text className="text-xs text-gray-500">{tx.date}</Text>
          </View>
          <Text className="font-bold text-green-600">
            {tx.amountTHB.toFixed(2)} ฿
          </Text>
        </View>
      ))}
    </View>
  );
}
