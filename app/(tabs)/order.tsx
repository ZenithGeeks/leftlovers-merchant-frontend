import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ContentSwitcher from "@/components/Menu/Content-Switcher";
import OrderListRow from "@/components/Order/OrderListRow";
import { ThemedView } from "@/components/themed-view";
import { SPACING } from "@/constants/theme";
import { fetchMerchantOrders } from "@/services/order";
import type { Order, OrderStatus } from "@/types/types";

// ✅ UI Tab type (NOT the same as API enum)
type OrderTab = "PENDING" | "READY" | "HISTORY";

const tabForStatus = (status: OrderStatus): OrderTab => {
  switch (status) {
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

export default function OrderPage() {
  const insets = useSafeAreaInsets();
  const merchantId = process.env.EXPO_PUBLIC_MERCHANT_ID;

  const [orderListFilter, setOrderListFilter] = useState<OrderTab>("PENDING");

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05;
    return Math.max(14, Math.min(pct, 10));
  }, [screenWidth]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!merchantId) {
      setOrders([]);
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await fetchMerchantOrders(merchantId);
      setOrders(data ?? []);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!alive) return;
      await loadOrders();
    };

    run();

    return () => {
      alive = false;
    };
  }, [loadOrders]);

  // ✅ When child updates an order status, patch local list
  const handleOrderUpdated = useCallback((next: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === next.id ? { ...o, ...next } : o))
    );
  }, []);
  const onTabChange = (k: OrderTab) => {
    loadOrders();
    setOrderListFilter(k);
  };
  return (
    <ThemedView
      className="flex-1"
      style={{
        paddingTop: insets.top + SPACING.lg,
        paddingHorizontal: horizontalPadding,
      }}
    >
      <View className="mb-6 gap-3">
        <Text className="text-[36px] font-extrabold text-[#0B1220]">Order</Text>

        <ContentSwitcher
          tabs={[
            { key: "PENDING", label: "Pending" },
            { key: "READY", label: "Ready" },
            { key: "HISTORY", label: "History" },
          ]}
          value={orderListFilter}
          onChange={(k) => onTabChange(k as OrderTab)}
        />
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 text-xs text-gray-500">Loading orders...</Text>
        </View>
      )}

      {!loading && !!errorMsg && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm font-semibold text-gray-900">
            Couldn&apos;t load orders
          </Text>
          <Text className="mt-1 text-xs text-gray-500 text-center">
            {errorMsg}
          </Text>
        </View>
      )}

      {!loading && !errorMsg && (
        <FlatList
          data={orders}
          extraData={orderListFilter} // ✅ ensures UI refresh on tab switch
          keyExtractor={(o) => o.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + SPACING.xl,
          }}
          renderItem={({ item }) => {
            if (tabForStatus(item.status) !== orderListFilter) return null;

            return (
              <View
                className="w-full mb-4"
                style={{ paddingHorizontal: horizontalPadding }}
              >
                {/* ✅ pass callback so row can update parent */}
                <OrderListRow item={item} onUpdated={handleOrderUpdated} />
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-10">
              <Text className="text-sm text-gray-500">
                No orders in this tab yet.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}
