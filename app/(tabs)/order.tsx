import React, { useMemo, useState } from "react";
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

export default function OrderPage() {
  const insets = useSafeAreaInsets();
  const [orderListFilter, setOrderListFilter] = useState<ORDER_STATUS>("upcoming");

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(() => {
      const pct = screenWidth * 0.05;
      return Math.max(14, Math.min(pct, 24));
    }, [screenWidth]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  const orders: OrderListItem[] = [
    { bookingId: 'B001', userName: 'Alice', pickupTime: new Date(year, month, day, 18, 0), status: 'upcoming' },
    { bookingId: 'B002', userName: 'Bob', pickupTime: new Date(year, month, day, 18, 30), status: 'upcoming' },
    { bookingId: 'B003', userName: 'Charlie', pickupTime: new Date(year, month, day, 14, 0), status: 'history' },
    { bookingId: 'B004', userName: 'David', pickupTime: new Date(year, month, day, 19, 30), status: 'ready' },
    { bookingId: 'B005', userName: 'Eve', pickupTime: new Date(year, month, day, 14, 0), status: 'history' },
    { bookingId: 'B006', userName: 'Frank', pickupTime: new Date(year, month, day, 20, 30), status: 'upcoming' },
  ];

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
        data={orders}
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
