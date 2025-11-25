import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ContentSwitcher from "@/components/Menu/Content-Switcher";
import OrderListRow from "@/components/Order/OrderListRow";

import { ThemedView } from "@/components/themed-view";

import { SPACING } from "@/constants/theme";
import { ORDER_STATUS, OrderListItem } from "@/constants/order.type";

import orderMockupData from "@/mockupData/order.json";


export default function OrderPage() {
  const insets = useSafeAreaInsets();
  const [orderListFilter, setOrderListFilter] = useState<ORDER_STATUS>("upcoming");
  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(() => {
      const pct = screenWidth * 0.05;
      return Math.max(14, Math.min(pct, 24));
    }, [screenWidth]);

  const [orderList, setOrderList] = useState<OrderListItem[]>([]);

  useEffect(() => {
    // In real scenario, fetch order list from API here
    const orderDataFromJson: OrderListItem[] = orderMockupData.bookingList.map((order: any) => ({
      ...order,
      pickupTime: new Date(order.pickupTime),
    }));
    setOrderList(orderDataFromJson);
  }, []);

  if (!orderList) {
    return null;
  }

  return (
    <ThemedView
      style={[
        styles.screen,
        {
          paddingTop: insets.top + SPACING.lg,
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Order</Text>
        <ContentSwitcher
          tabs={[
            { key: "upcoming", label: "Upcoming" },
            { key: "ready", label: "Ready" },
            { key: "history", label: "History" },
          ]}
          value={orderListFilter}
          onChange={(k) => setOrderListFilter(k as any)}
        />
      </View>
      {/* Order List */}
      <FlatList
        data={orderList}
        keyExtractor={(s) => s.bookingId}
        contentContainerStyle={{
          paddingBottom: insets.bottom + SPACING.xl,
        }}
        renderItem={({ item }) => {
          if (item.status !== orderListFilter) return null;
          return (
            <View
              style={[
                styles.wrapperRow,
                { paddingHorizontal: horizontalPadding },
               ]}
            >
              <OrderListRow item={item} />
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#11181C",
  },
  wrapperRow: {
    width: "100%",
    marginBottom: SPACING.lg,
  },
});
