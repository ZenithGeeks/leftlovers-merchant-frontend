// app/(tabs)/finance.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Tabs from "@/components/finance/Tabs";
import { SummaryTab } from "@/components/finance/SummaryTab";
import { TransactionTab } from "@/components/finance/TransactionTab";
import { PayoutTab } from "@/components/finance/PayoutTab";
import { ThemedView } from "@/components/themed-view";

import type { DateKey, Payout, Summary, TabKey, Transaction } from "@/types/finance";
import { DEV_MERCHANT_ID } from "@/utils/env";
import {
  fetchFinancePayouts,
  fetchFinanceSummary,
  fetchFinanceTransactions,
} from "@/services/finance";

const DEFAULT_RANGE: DateKey = "Today";
const DEFAULT_TAB: TabKey = "Summary";


const MERCHANT_ID = DEV_MERCHANT_ID || "REPLACE_ME_MERCHANT_ID";

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(
    () => Math.max(14, Math.min(screenWidth * 0.05, 24)),
    [screenWidth]
  );

  const [activeTab, setActiveTab] = useState<TabKey>(DEFAULT_TAB);
  const [selectedDate, setSelectedDate] = useState<DateKey>(DEFAULT_RANGE);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<Summary>({
    netSales: 0,
    deduction: 0,
    netEarnings: 0,
    earnings: 0,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const [tx, po, su] = await Promise.all([
          fetchFinanceTransactions(MERCHANT_ID, selectedDate, ctrl.signal),
          fetchFinancePayouts(MERCHANT_ID, selectedDate, ctrl.signal),
          fetchFinanceSummary(MERCHANT_ID, selectedDate, ctrl.signal),
        ]);
        setTransactions(tx);
        setPayouts(po);
        setSummary(su);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Failed to load finance data");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      ctrl.abort();
    };
  }, [selectedDate]);

  return (
    <ThemedView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Header + tabs (same pattern as MenuScreen) */}
        <ThemedView
          className="w-full bg-white"
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: horizontalPadding,
          }}
        >
          <Text className="text-[36px] font-extrabold text-[#0B1220] mb-4">Finance</Text>
          <Tabs active={activeTab} onChange={setActiveTab} />
        </ThemedView>

        {/* Main content area with same horizontal padding */}
        <View
          className="bg-white"
          style={{ paddingHorizontal: horizontalPadding }}
        >
          {/* Error */}
          {err && (
            <View className="mt-4 p-3 rounded-xl bg-red-50">
              <Text className="text-red-600">{err}</Text>
            </View>
          )}

          {/* Loading */}
          {loading && (
            <View className="mt-6 items-center">
              <ActivityIndicator />
              <Text className="text-gray-500 mt-2">Loading…</Text>
            </View>
          )}

          {/* Content */}
          {!loading && !err && (
            <>
              {activeTab === "Summary" && (
                <SummaryTab
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  data={summary}
                />
              )}

              {activeTab === "Transaction" && (
                <TransactionTab
                  date={selectedDate}
                  onDateChange={setSelectedDate}
                  data={transactions}
                />
              )}

              {activeTab === "Payout" && (
                <PayoutTab
                  date={selectedDate}
                  onDateChange={setSelectedDate}
                  data={payouts}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
