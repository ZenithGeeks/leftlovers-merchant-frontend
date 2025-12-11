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

const filterOrdersByTab = (orders: Order[], tab: OrderTab): Order[] =>
  orders.filter((o) => tabForStatus(o.status) === tab);

const isNoOrdersError = (err: unknown): boolean => {
  const anyErr = err as any;
  const status = anyErr?.status ?? anyErr?.response?.status;
  const msg = String(anyErr?.message ?? "").toLowerCase();
  if (status === 404) return true;
  if (msg.includes("404")) return true;
  if (msg.includes("not found")) return true;
  return false;
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

  const loadOrders = useCallback(async () => {
    if (!merchantId) {
      setOrders([]);
      setErrorMsg(null);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await fetchMerchantOrders(merchantId);
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
  }, [merchantId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
                  <OrderListRow item={item} onUpdated={handleOrderUpdated} merchantId={merchantId!} />
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
