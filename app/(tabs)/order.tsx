import React, { useMemo, useState } from "react";
import {
  FlatList,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ContentSwitcher from "@/components/Menu/Content-Switcher";
import { ThemedView } from "@/components/themed-view";

const SPACING = { xs: 6, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

type ORDER_STATUS = 'upcoming' | 'ready' | 'history';

export default function OrderPage() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<ORDER_STATUS>("upcoming");

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(() => {
      const pct = screenWidth * 0.05;
      return Math.max(14, Math.min(pct, 24));
    }, [screenWidth]);

  return (
     <ScrollView style={{ marginBottom: insets.bottom + SPACING.xl, flex: 1, height: '100%' }}>
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
            value={tab}
            onChange={(k) => setTab(k as any)}
          />
        </View>
      </ThemedView>
    </ScrollView>
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
  },
});
