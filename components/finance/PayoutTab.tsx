import React from 'react';
import { Text, View } from 'react-native';
import { CheckIcon } from 'react-native-heroicons/outline';
import type { DateKey, Payout } from '../../types/finance';
import { DatePills } from './DatePills';
import { filterByDateRange } from '@/utils/financeFilters';
import dayjs from 'dayjs';

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
          className="flex-row justify-between items-center border-b border-gray-200 py-3"
        >
          <View>
            <Text className="font-semibold text-gray-900">{p.detailDate}</Text>
            <Text className="text-xs text-gray-500 py-1">
              {dayjs(p.processedAt).format('DD/MM/YYYY hh:mma')}
            </Text>
          </View>

          <View className="items-end">
            <Text className="font-bold text-gray-900">
              {p.amountTHB.toFixed(2)} ฿
            </Text>

            {/* ✅ Transferred status badge */}
            {p.status === 'Transferred' && (
              <View className="flex-row items-center bg-green-50 rounded-full px-2.5 py-1 mt-1">
                <CheckIcon size={14} color="#22C55E" strokeWidth={2.5} />
                <Text className="text-[12px] font-medium text-green-600 ml-1">
                  Transferred
                </Text>
              </View>
            )}

            {/* 🕒 Other statuses (optional fallback) */}
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
      ))}
    </View>
  );
}
