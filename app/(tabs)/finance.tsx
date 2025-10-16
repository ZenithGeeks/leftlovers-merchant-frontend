import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import mockData from '@/mockupData/finance.json';
import  Tabs  from '@/components/finance/Tabs';
import { SummaryTab } from '@/components/finance/SummaryTab';
import { TransactionTab } from '@/components/finance/TransactionTab';
import { PayoutTab } from '@/components/finance/PayoutTab';
import type { TabKey, DateKey, Payout } from '@/components/finance/types';
import { filterByDateRange, computeSummaryFromTransactions } from '@/utils/financeFilters';

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = useMemo(() => Math.max(14, Math.min(screenWidth * 0.05, 24)), [screenWidth]);

  const [activeTab, setActiveTab] = useState<TabKey>('Summary');
  const [date, setDate] = useState<DateKey>('Today');

  const { transactions, payouts, summary } = mockData;

  // Coerce payout.status to the union type once (typed safety)
  const typedPayouts: Payout[] = useMemo(
    () =>
      payouts.map((p) => ({
        ...p,
        status: (p.status === 'Transferred' || p.status === 'Pending' || p.status === 'Failed')
          ? p.status
          : 'Pending',
      })),
    [payouts]
  );

  // Filtered data (fast & memoized)
    // For transactions
  const filteredTransactions = useMemo(
    () => filterByDateRange(transactions, date, (t) => t.date),
    [transactions, date]
  );

  
  // For payouts (note: using detailDate)
  const filteredPayouts = useMemo(
    () => filterByDateRange(typedPayouts, date, (p) => p.detailDate),
    [typedPayouts, date]
  );

  // Dynamic summary from filtered transactions (or fallback to mock summary)
  const dynamicSummary = useMemo(
    () => computeSummaryFromTransactions(filteredTransactions, { feeRate: 0.08 }),
    [filteredTransactions]
  );
  
  //console.log('Mock data', mockData);
  //console.log('Filtered transactions', filteredTransactions.length);
  //console.log('Filtered payouts', filteredPayouts.length);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top + 24, paddingHorizontal: horizontalPadding }}>
        <Text className="text-2xl font-bold text-black mb-4">Finance</Text>

        <Tabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'Summary' && (
          <SummaryTab selectedDate={date} onDateChange={setDate} data={dynamicSummary || summary} />
        )}


        {activeTab === 'Transaction' && (
          <TransactionTab date={date} onDateChange={setDate} data={filteredTransactions} />
        )}

        {activeTab === 'Payout' && (
          <PayoutTab date={date} onDateChange={setDate} data={filteredPayouts} />
        )}
      </View>
    </ScrollView>
  );
}
