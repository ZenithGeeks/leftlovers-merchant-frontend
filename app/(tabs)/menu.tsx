import ContentSwitcher from "@/components/Menu/Content-Switcher";
import { ThemedView } from "@/components/themed-view";
import data from "@/mockupData/menuData.json";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const SPACING = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};


const mockupMenuItems = data.menuItems.slice(0, 3).map((item) => ({
  id: item.id,
  imageUrl: item.photoUrl,
  title: item.name,
  price: item.basePrice,
  orders: Math.floor(Math.random() * 100) + 1,
  leftOverQty: item.leftoverQty,
}));

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = React.useState<"items" | "options">("items");
  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05;
    return Math.max(14, Math.min(pct, 24));
  }, [screenWidth]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ marginBottom: insets.bottom + SPACING.xl }}
    >
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
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Menu</Text>
          <ContentSwitcher
            tabs={[
              { key: "items", label: "Items" },
              { key: "options", label: "Options" },
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
});
