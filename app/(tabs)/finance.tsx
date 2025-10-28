import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Tabs from '@/components/finance/Tabs';
import { SummaryTab } from '@/components/finance/SummaryTab';
import { TransactionTab } from '@/components/finance/TransactionTab';
import { PayoutTab } from '@/components/finance/PayoutTab';
import mockData from '@/mockupData/finance.json';
import type { DateKey, Payout, TabKey } from '@/types/finance';
import { computeSummaryFromTransactions, filterByDateRange } from '@/utils/financeFilters';
import { ThemedView } from '@/components/themed-view';

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;

  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05;
    return Math.max(16, Math.min(pct, 28));
  }, [screenWidth]);

  const [activeTab, setActiveTab] = useState<TabKey>('Summary');
  const [date, setDate] = useState<DateKey>('Today');

  const { transactions, payouts, summary } = mockData;

  const typedPayouts: Payout[] = useMemo(
    () =>
      payouts.map((p) => ({
        ...p,
        status:
          p.status === 'Transferred' || p.status === 'Pending' || p.status === 'Failed'
            ? p.status
            : 'Pending',
      })),
    [payouts]
  );

  const filteredTransactions = useMemo(
    () => filterByDateRange(transactions, date, (t) => t.date),
    [transactions, date]
  );
  const filteredPayouts = useMemo(
    () => filterByDateRange(typedPayouts, date, (p) => p.detailDate),
    [typedPayouts, date]
  );

  const dynamicSummary = useMemo(
    () => computeSummaryFromTransactions(filteredTransactions, { feeRate: 0.08 }),
    [filteredTransactions]
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        <ThemedView
          className="w-full"
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View className="mb-6 gap-3">
            <Text className="text-[36px] font-extrabold text-[#0B1220]">
              Finance
            </Text>

            <Tabs active={activeTab} onChange={setActiveTab} />
          </View>
        </ThemedView>

        <ThemedView className="w-full" style={{ paddingHorizontal: horizontalPadding }}>
          {activeTab === 'Summary' && (
            <SummaryTab
              selectedDate={date}
              onDateChange={setDate}
              data={dynamicSummary || summary}
            />
          )}

          {activeTab === 'Transaction' && (
            <TransactionTab
              date={date}
              onDateChange={setDate}
              data={filteredTransactions}
            />
          )}

          {activeTab === 'Payout' && (
            <PayoutTab
              date={date}
              onDateChange={setDate}
              data={filteredPayouts}
            />
          )}
        </ThemedView>
      </ScrollView>
    </View>
  );
}
