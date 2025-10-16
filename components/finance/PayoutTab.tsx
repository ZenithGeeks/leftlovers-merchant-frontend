import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatePills } from './DatePills';
import type { DateKey, Payout } from './types';

export function PayoutTab({
  date,
  onDateChange,
  data,
}: {
  date: DateKey;
  onDateChange: (v: DateKey) => void;
  data: Payout[];
}) {
  return (
    <View>
      <DatePills value={date} onChange={onDateChange} />

      <View className="flex-row justify-between mb-4">
        <View>
          <Text className="text-gray-600 font-medium">Balance</Text>
          <Text className="text-2xl font-bold text-black">
            ฿{data[0]?.balanceTHB.toFixed(2)}
          </Text>
        </View>
        <View>
          <Text className="text-gray-600 font-medium">Owe to Leftlovers</Text>
          <Text className="text-2xl font-bold text-black">
            ฿{data[0]?.oweTHB.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text className="text-lg font-bold mb-3">Payout details</Text>

      {data.map((p, i) => (
        <View
          key={`${p.detailDate}-${i}`}
          className="flex-row justify-between items-start bg-white rounded-xl border border-gray-200 p-4 mb-3"
        >
          <View>
            <Text className="text-gray-900 font-semibold">{p.detailDate}</Text>
            <Text className="text-gray-500 text-xs">{p.processedAt}</Text>
          </View>
          <View className="items-end">
            <Text className="text-black font-bold">
              {p.amountTHB.toFixed(2)} THB
            </Text>
            <View className="flex-row items-center gap-1 bg-green-50 rounded-full px-2 py-0.5 mt-1">
              <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
              <Text className="text-green-600 text-xs font-semibold">
                {p.status}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
