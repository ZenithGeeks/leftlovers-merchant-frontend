import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// NEW imports
import {
  PayoutTab,
  SummaryTab,
  Tabs,
  TransactionTab,
  type DateKey,
  type Payout,
  type TabKey,
  type Transaction
} from '@/components/finance';

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;

  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05;
    return Math.max(14, Math.min(pct, 24));
  }, [screenWidth]);

  const [activeTab, setActiveTab] = useState<TabKey>('Summary');
  const [date, setDate] = useState<DateKey>('Today');

  // mock data
  const transaction: Transaction = {
    date: '20 Sep 2025',
    title: 'Payment LL-015',
    id: '0123456789',
    amountTHB: 1500,
    time: '5:43PM',
  };

  const payout: Payout = {
    balanceTHB: 1500,
    oweTHB: 0,
    detailDate: '22 09 2025',
    processedAt: '23/09/2025 05:58AM',
    amountTHB: 1500,
    status: 'Transferred',
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <ThemedView style={[styles.container, { paddingTop: insets.top + 24, paddingHorizontal: horizontalPadding }]}>
        <Text style={styles.header}>Finance</Text>

        <Tabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'Summary' && (
          <>
      
            <SummaryTab />
          </>
        )}

        {activeTab === 'Transaction' && (
          <TransactionTab date={date} onDateChange={setDate} data={transaction} />
        )}

        {activeTab === 'Payout' && (
          <PayoutTab date={date} onDateChange={setDate} data={payout} />
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { fontSize: 24, fontFamily: Fonts.bold, marginBottom: 16, color: '#000' },
});
