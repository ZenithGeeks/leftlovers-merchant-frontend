import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import mockData from '@/mockupData/finance.json';
import { Tabs } from '@/components/finance/Tabs';
import { DatePills } from '@/components/finance/DatePills';
import { SummaryTab } from '@/components/finance/SummaryTab';
import { TransactionTab } from '@/components/finance/TransactionTab';
import { PayoutTab } from '@/components/finance/PayoutTab';
import type { TabKey, DateKey } from '@/components/finance/types';

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = useMemo(() => Math.max(14, Math.min(screenWidth * 0.05, 24)), [screenWidth]);

  const [activeTab, setActiveTab] = useState<TabKey>('Summary');
  const [date, setDate] = useState<DateKey>('Today');

  const { transactions, payouts, summary } = mockData;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View
        className="flex-1 bg-white"
        style={{ paddingTop: insets.top + 24, paddingHorizontal: horizontalPadding }}
      >
        <Text className="text-2xl font-bold text-black mb-4">Finance</Text>

        <Tabs active={activeTab} onChange={setActiveTab} />
        {activeTab === 'Summary' && (
        <SummaryTab
          selectedDate={date}
          onDateChange={setDate}
          data={summary}
        />
        )}
        {activeTab === 'Transaction' && (
          <TransactionTab date={date} onDateChange={setDate} data={transactions} />
        )}
        {activeTab === 'Payout' && (
          <PayoutTab date={date} onDateChange={setDate} 
                    data={mockData.payouts.map(p => ({ ...p, status: p.status as 'Transferred' | 'Pending' | 'Failed' }))} />
        )}
      </View>
    </ScrollView>
  );
}
