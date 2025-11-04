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

import { filterByDateRange, computeSummaryFromTransactions } from '@/utils/financeFilters';
import { buildDailyPayoutsFromPayments } from '@/utils/payouts'; 

const FEE_RATE = 0.15;

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();

  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = useMemo(
    () => Math.max(14, Math.min(screenWidth * 0.05, 24)),
    [screenWidth]
  );

  const [activeTab, setActiveTab] = useState<TabKey>('Summary');
  const [selectedDate, setSelectedDate] = useState<DateKey>('Today');

  // Mock data (payments-like transactions)
  const transactions = (mockData.transactions ?? []) as Transaction[];

  // Filter payments by the pill (Today/This week/etc.) using their paid date (`date` in the mock)
  const filteredTransactions = useMemo(
    () => filterByDateRange(transactions, selectedDate, (t) => t.date),
    [transactions, selectedDate]
  );

  // Summary (net sales, fees, earnings) from filtered payments
  const dynamicSummary = useMemo(
    () => computeSummaryFromTransactions(filteredTransactions, { feeRate: FEE_RATE }),
    [filteredTransactions]
  );

  // ⚠️ Daily-grouped payouts: all payments from the same day are aggregated
  // into a SINGLE payout that transfers the NEXT day.
  //
  // utils/payouts.ts should export:
  //   export function buildDailyPayoutsFromPayments(txns: PaymentTxn[], feeRate?: number): Payout[]
  //
  const computedPayouts: Payout[] = useMemo(
    () => buildDailyPayoutsFromPayments(filteredTransactions as any, FEE_RATE),
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
        <Text className="text-[32px] font-extrabold text-[#0B1220] mb-4">Finance</Text>

        <Tabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'Summary' && (
          <SummaryTab
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            data={dynamicSummary}
          />
        )}

        {activeTab === 'Transaction' && (
          <TransactionTab
            date={selectedDate}
            onDateChange={setSelectedDate}
            data={filteredTransactions}
          />
        )}

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
