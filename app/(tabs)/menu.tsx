import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ContentSwitcher from "@/components/Menu/Content-Switcher";
import MenuWrapper from "@/components/Menu/Menu-Wrapper";
import { ThemedView } from "@/components/themed-view";
import data from "@/mockupData/menuData.json";

const SPACING = { xs: 6, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

// ----- helpers -----
type MenuItemJson = {
  id: string;
  name: string;
  basePrice: number;
  leftoverQty: number;
  photoUrl: string;
  categoryId?: string | null;
  categoryName?: string | null; // if you store the name directly
};

type ListItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
};

type Section = {
  id: string;
  title: string;
  items: ListItem[];
};

// transform one item to ListItem shape
const toListItem = (m: MenuItemJson): ListItem => ({
  id: m.id,
  name: m.name,
  price: m.basePrice,
  imageUrl: m.photoUrl,
  inStock: (m.leftoverQty ?? 0) > 0,
});


const groupByCategory = (items: MenuItemJson[]): Section[] => {
  const map = new Map<string, Section>();
  const UNCATEGORIZED = "Uncategorized";

  items.forEach((m) => {
    const title =
      m.categoryName?.trim() ||
      'Food' ||
      UNCATEGORIZED; // fallback if no category

    if (!map.has(title)) {
      map.set(title, { id: title, title, items: [] });
    }
    map.get(title)!.items.push(toListItem(m));
  });

  return Array.from(map.values()).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
};

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"items" | "options">("items");

  // responsive horizontal padding (clamped)
  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05;
    return Math.max(14, Math.min(pct, 24));
  }, [screenWidth]);

  // sections = many MenuWrapper blocks
  const sections = useMemo(
    () => groupByCategory((data.menuItems as MenuItemJson[]) || []),
    []
  );

  return (
    <ScrollView style={{ marginBottom: insets.bottom + SPACING.xl, flex: 1, height: '100%' }}>
    <FlatList
      data={sections}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{
        paddingBottom: insets.bottom + SPACING.xl,
      }}
      ListHeaderComponent={
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
            <Text style={styles.title}>Menu</Text>
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
      }
      renderItem={({ item }) => (
        <ThemedView
          style={[
            styles.wrapperRow,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          {tab === "items" ? (
            <MenuWrapper
              title={item.title}
              items={item.items}
              defaultExpanded={true}
              onToggleItem={(id, val) =>
                console.log(`[${item.title}] toggle ${id}: ${val}`)
              }
            />
          ) : (
            // Options tab placeholder (you can swap in your real Options component)
            <MenuWrapper
              title={`${item.title} Options`}
              items={[]} // empty list in options mode for now
              defaultExpanded={true}
            />
          )}
        </ThemedView>
      )}
      ItemSeparatorComponent={() => <View style={{ height: SPACING.lg }} />}
      showsVerticalScrollIndicator={false}
    />
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
