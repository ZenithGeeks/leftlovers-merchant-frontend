// app/(tabs)/finance.tsx
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Tabs from '@/components/finance/Tabs';
import { SummaryTab } from '@/components/finance/SummaryTab';
import { TransactionTab } from '@/components/finance/TransactionTab';
import { PayoutTab } from '@/components/finance/PayoutTab';

import mockData from '@/mockupData/finance.json';
import type { DateKey, Payout, TabKey, Transaction } from '@/types/finance';

import { filterByDateRange, computeSummaryFromTransactions } from '@/utils/financeFilters'; // <= singular
import { buildPayoutsFromPayments } from '@/utils/payouts';

const FEE_RATE = 0.15;

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();

  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = useMemo(
    () => Math.max(14, Math.min(screenWidth * 0.05, 24)),
    [screenWidth]
  );

  // ✅ restore the missing state
  const [activeTab, setActiveTab] = useState<TabKey>('Summary');
  const [selectedDate, setSelectedDate] = useState<DateKey>('Today');

  // Mock data (can be only transactions; payouts/summary are computed)
  const transactions = (mockData.transactions ?? []) as Transaction[];

  // Filtered transactions by pill
  const filteredTransactions = useMemo(
    () => filterByDateRange(transactions, selectedDate, (t) => t.date),
    [transactions, selectedDate]
  );

  // Summary uses 15% fee
  const dynamicSummary = useMemo(
    () => computeSummaryFromTransactions(filteredTransactions, { feeRate: FEE_RATE }),
    [filteredTransactions]
  );

  // Compute payouts from filtered txns (next day, net of 15%)
  const computedPayouts: Payout[] = useMemo(
  () => buildPayoutsFromPayments(filteredTransactions, FEE_RATE),
  [filteredTransactions]
);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View
        className="flex-1 bg-white"
        style={{ paddingTop: insets.top + 16, paddingHorizontal: horizontalPadding }}
      >
        {/* Page header */}
        <Text className="text-[32px] font-extrabold text-[#0B1220] mb-4">
          Finance
        </Text>

        {/* Tabs */}
        <Tabs active={activeTab} onChange={setActiveTab} />

        {/* Summary */}
        {activeTab === 'Summary' && (
          <SummaryTab
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            data={dynamicSummary}
          />
        )}

        {/* Transactions */}
        {activeTab === 'Transaction' && (
          <TransactionTab
            date={selectedDate}
            onDateChange={setSelectedDate}
            data={filteredTransactions}
          />
        )}

        {/* Payouts */}
        {activeTab === 'Payout' && (
          <PayoutTab
            date={selectedDate}
            onDateChange={setSelectedDate}
            data={computedPayouts}
          />
        )}
      </View>
    </ScrollView>
  );
}
