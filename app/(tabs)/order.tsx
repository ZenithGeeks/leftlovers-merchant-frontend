import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ContentSwitcher from "@/components/Menu/Content-Switcher";
import OrderListRow from "@/components/Order/OrderListRow";
import { ThemedView } from "@/components/themed-view";
import { SPACING } from "@/constants/theme";
import { useMerchant } from "@/context/MerchantContext";
import { fetchMerchantOrders } from "@/services/order";
import type { Order, OrderStatus } from "@/types/types";

type OrderTab = "PENDING" | "READY" | "HISTORY";

const tabForStatus = (status: OrderStatus | string): OrderTab => {
  const s = String(status).toUpperCase();
  switch (s) {
    case "READY":
      return "READY";
    case "PICKED_UP":
    case "CANCELLED":
      return "HISTORY";
    case "PENDING":
    case "CONFIRMED":
    default:
      return "PENDING";
  }
};

const filterOrdersByTab = (orders: Order[], tab: OrderTab): Order[] =>
  orders
    .filter((o) => tabForStatus(o.status) === tab)
    .sort((a, b) => {
      const da = new Date(a.createdAt ?? 0).getTime();
      const db = new Date(b.createdAt ?? 0).getTime();
      return db - da; // newest first
    });

const isNoOrdersError = (err: unknown): boolean => {
  const anyErr = err as any;
  const status = anyErr?.status ?? anyErr?.response?.status;
  const msg = String(anyErr?.message ?? "").toLowerCase();
  if (status === 404) return true;
  if (msg.includes("404")) return true;
  if (msg.includes("no orders") || msg.includes("not found")) return true;
  return false;
};

const isSameLocalDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const buildSummary = (orders: Order[]) => {
  const today = new Date();
  let pending = 0;
  let readyToday = 0;
  let revenueToday = 0;

  for (const o of orders) {
    if (o.status === "PENDING" || o.status === "CONFIRMED") {
      pending += 1;
    }

    const created = new Date(o.createdAt);
    const isToday =
      !Number.isNaN(created.getTime()) && isSameLocalDay(created, today);

    if (o.status === "READY" && isToday) {
      readyToday += 1;
    }

    if (o.paymentStatus === "PAID" && isToday) {
      const amt = Number(o.totalAmount ?? 0);
      if (!Number.isNaN(amt)) {
        revenueToday += amt;
      }
    }
  }

  return { pending, readyToday, revenueToday };
};

export default function OrderPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { merchantId } = useMerchant();

  const [orderListFilter, setOrderListFilter] =
    useState<OrderTab>("PENDING");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const horizontalPadding = useMemo(() => {
    const pct = width * 0.05;
    return Math.max(14, Math.min(pct, 24));
  }, [width]);

  const visibleOrders = useMemo(
    () => filterOrdersByTab(orders, orderListFilter),
    [orders, orderListFilter]
  );

  const summary = useMemo(() => buildSummary(orders), [orders]);
  const hasAnyOrders = orders.length > 0;

  const loadOrders = useCallback(
    async (mid: string) => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const data = await fetchMerchantOrders(mid);
        setOrders(data ?? []);
      } catch (err: any) {
        if (isNoOrdersError(err)) {
          setOrders([]);
          setErrorMsg(null);
        } else {
          setOrders([]);
          setErrorMsg(err?.message ?? "Failed to load orders.");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!merchantId) return;
    loadOrders(merchantId);
  }, [merchantId, loadOrders]);

  const handleOrderUpdated = useCallback((next: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === next.id ? { ...o, ...next } : o))
    );
  }, []);

  const handleTabChange = (tab: OrderTab) => {
    setOrderListFilter(tab);
  };

  const showEmptyState =
    !loading && !errorMsg && visibleOrders.length === 0;

  if (!merchantId) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <Text className="text-sm text-gray-500">
          No store selected. Please go back to Home first.
        </Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      className="flex-1"
      style={{
        paddingTop: insets.top + SPACING.lg,
        paddingHorizontal: horizontalPadding,
      }}
    >
      <View className="mb-6 gap-3">
        <Text className="text-[36px] font-extrabold text-[#0B1220]">
          Order
        </Text>

        {/* summary chips */}
        {hasAnyOrders && (
          <View className="flex-row flex-wrap gap-2 mt-1">
            <View className="rounded-full bg-gray-100 px-3 py-1">
              <Text className="text-[11px] text-gray-700">
                {summary.pending} pending
              </Text>
            </View>
            <View className="rounded-full bg-emerald-50 px-3 py-1">
              <Text className="text-[11px] text-emerald-700">
                {summary.readyToday} ready today
              </Text>
            </View>
            <View className="rounded-full bg-slate-900 px-3 py-1">
              <Text className="text-[11px] text-white">
                ฿{summary.revenueToday.toLocaleString()} today
              </Text>
            </View>
          </View>
        )}

        <ContentSwitcher
          tabs={[
            { key: "PENDING", label: "Pending" },
            { key: "READY", label: "Ready" },
            { key: "HISTORY", label: "History" },
          ]}
          value={orderListFilter}
          onChange={(k) => handleTabChange(k as OrderTab)}
        />
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 text-xs text-gray-500">
            Loading orders...
          </Text>
        </View>
      )}

      {!loading && errorMsg && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm font-semibold text-gray-900">
            Something went wrong
          </Text>
          <Text className="mt-1 text-xs text-gray-500 text-center">
            {errorMsg}
          </Text>
        </View>
      )}

      {!loading && !errorMsg && (
        <>
          {showEmptyState ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm text-gray-500">
                No orders in this tab yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={visibleOrders}
              keyExtractor={(o) => o.id}
              contentContainerStyle={{
                paddingBottom: insets.bottom + SPACING.xl,
              }}
              renderItem={({ item }) => (
                <View className="w-full mb-4">
                  <OrderListRow
                    item={item}
                    onUpdated={handleOrderUpdated}
                    merchantId={merchantId}
                  />
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </ThemedView>
  );
}
