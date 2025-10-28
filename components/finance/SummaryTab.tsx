import { Text, View } from 'react-native';
import type { DateKey, Summary } from '../../types/finance';
import { DatePills } from './DatePills';

export function SummaryTab({
  selectedDate,
  onDateChange,
  data,
}: {
  selectedDate: DateKey;
  onDateChange: (v: DateKey) => void;
  data: Summary;
}) {
  return (
    <View>
      {/* Date Filter */}
      <DatePills value={selectedDate} onChange={onDateChange} />

      {/* Summary Info */}
      <Text className="text-gray-500 text-sm mb-2">
        Showing data for {selectedDate}
      </Text>

      <Text className="text-gray-800 font-medium">Net Sales</Text>
      <Text className="text-[22px] font-bold text-black mb-4">
        +฿{data.netSales.toFixed(2)}
      </Text>

      <Text className="text-gray-800 font-medium">Earnings</Text>
      <Text className="text-[22px] font-bold text-black mb-4">
        +฿{data.earnings.toFixed(2)}
      </Text>

      <Text className="text-[20px] font-semibold mt-6 mb-3">Summary Details</Text>

      <View className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-700 font-medium">Net Sales</Text>
          <Text className="text-gray-800 font-semibold">
            {data.netSales.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-700 font-medium">Deduction</Text>
          <Text className="text-gray-800 font-semibold">
            -{data.deduction.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-900 font-bold">Net earnings</Text>
          <Text className="text-gray-900 font-bold">
            +{data.netEarnings.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
