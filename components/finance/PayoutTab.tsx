// components/finance/PayoutTab.tsx
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import dayjs from 'dayjs';
import { CheckIcon } from 'react-native-heroicons/outline';

import type { DateKey, Payout } from '@/types/finance';
import { DatePills } from './DatePills';
import { filterByDateRange } from '@/utils/financeFilters';

type Props = {
  date: DateKey;
  onDateChange: (v: DateKey) => void;
  data: Payout[];
};

export function PayoutTab({ date, onDateChange, data }: Props) {
  // Filter payouts by pill (Today / This week / etc.) using their detailDate (transfer date)
  const filtered = useMemo(
    () => filterByDateRange(data, date, (p) => p.detailDate),
    [data, date]
  );

  if (filtered.length === 0) {
    return (
      <View className="mt-4">
        <DatePills value={date} onChange={onDateChange} />
        <Text className="text-center text-gray-400 mt-4">No payouts found</Text>
      </View>
    );
  }

  return (
    <View className="mt-2">
      <DatePills value={date} onChange={onDateChange} />

      {filtered.map((p) => {
        const processed =
          p.processedAt && dayjs(p.processedAt).isValid()
            ? dayjs(p.processedAt).format('DD/MM/YYYY hh:mma')
            : null;

        return (
          <View
            key={p.id}
            className="flex-row justify-between items-center border-b border-gray-200 py-3"
          >
            {/* Left side: dates */}
            <View>
              {/* Transfer (detail) date */}
              <Text className="font-semibold text-gray-900">{p.detailDate}</Text>

              {/* Processed timestamp (if any) */}
              <Text className="text-xs text-gray-500 py-1">
                {p.status === 'Transferred'
                  ? processed ?? 'Transferred'
                  : `Scheduled for ${dayjs(p.detailDate).format('DD/MM/YYYY')}`}
              </Text>
            </View>

            {/* Right side: amount + status */}
            <View className="items-end">
              <Text className="font-bold text-gray-900">
                {p.amountTHB.toFixed(2)} ฿
              </Text>

              {/* Status badge */}
              {p.status === 'Transferred' && (
                <View className="flex-row items-center mt-1">
                  <View className="w-5 h-5 rounded-full bg-emerald-50 items-center justify-center">
                    <CheckIcon size={12} color="#22C55E" strokeWidth={2.5} />
                  </View>
                  <Text className="text-[12px] font-medium text-green-600 ml-1">
                    Transferred
                  </Text>
                </View>
              )}

              {p.status === 'Pending' && (
                <View className="flex-row items-center bg-yellow-50 rounded-full px-2.5 py-1 mt-1">
                  <Text className="text-[12px] font-medium text-yellow-600">
                    Pending
                  </Text>
                </View>
              )}

              {p.status === 'Failed' && (
                <View className="flex-row items-center bg-red-50 rounded-full px-2.5 py-1 mt-1">
                  <Text className="text-[12px] font-medium text-red-600">
                    Failed
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
