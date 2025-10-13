import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Optional auth imports — keep only what you use
import { useAuth } from "@clerk/clerk-expo";
import { signOut as fbSignOut, getAuth } from "firebase/auth";

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
  categoryName?: string | null;
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
    const title = m.categoryName?.trim() || "Food" || UNCATEGORIZED;

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
  const router = useRouter();
  const { signOut } = useAuth(); // Clerk hook

  const onLogout = async () => {
    try {
      await signOut?.(); // Clerk logout if available
    } catch {}
    try {
      const auth = getAuth();
      if (auth?.currentUser) await fbSignOut(auth); // Firebase fallback
    } catch {}

    router.replace("/(auth)/signin"); // adjust if your sign-in route differs
  };

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05;
    return Math.max(14, Math.min(pct, 24));
  }, [screenWidth]);

  const sections = useMemo(
    () => groupByCategory((data.menuItems as MenuItemJson[]) || []),
    []
  );

  return (
    <ScrollView
      style={{ marginBottom: insets.bottom + SPACING.xl, flex: 1, height: "100%" }}
    >
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
              <View style={styles.headerTop}>
                <Text style={styles.title}>Menu</Text>
                <TouchableOpacity
                  onPress={onLogout}
                  style={styles.logoutBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Log out"
                >
                  <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
              </View>

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
            style={[styles.wrapperRow, { paddingHorizontal: horizontalPadding }]}
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
              <MenuWrapper
                title={`${item.title} Options`}
                items={[]}
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
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#11181C",
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(17, 24, 28, 0.06)",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181C",
  },
  wrapperRow: {
    width: "100%",
  },
});
