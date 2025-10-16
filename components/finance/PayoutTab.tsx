import { View, Text } from 'react-native';
import { DatePills } from './DatePills';
import { filterByDateRange } from '@/utils/financeFilters';
import type { Payout, DateKey } from './types';

export function PayoutTab({
  date,
  onDateChange,
  data,
}: {
  date: DateKey;
  onDateChange: (v: DateKey) => void;
  data: Payout[];
}) {
  const filtered = filterByDateRange(data, date, (p) => p.detailDate);
  //console.log('Filtered payouts', filtered.length);

  if (filtered.length === 0) {
    return (
      <View className="mt-4">
        <DatePills value={date} onChange={onDateChange} />
        <Text className="text-center text-gray-400 mt-4">
          No payouts found
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-2">
      <DatePills value={date} onChange={onDateChange} />
      {filtered.map((p, idx) => (
        <View
          key={idx}
          className="flex-row justify-between border-b border-gray-200 py-2"
        >
          <View>
            <Text className="font-semibold text-gray-900">{p.detailDate}</Text>
            <Text className="text-xs text-gray-500">{p.processedAt}</Text>
          </View>
          <View className="items-end">
            <Text className="font-bold text-green-600">
              {p.amountTHB.toFixed(2)} ฿
            </Text>
            <Text className="text-xs text-gray-500">{p.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
