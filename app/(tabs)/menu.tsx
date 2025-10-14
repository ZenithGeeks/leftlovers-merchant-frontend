import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ContentSwitcher from "@/components/Menu/Content-Switcher";
import MenuWrapper from "@/components/Menu/Menu-Wrapper";
import OptionWrapper from "@/components/Menu/Option-Wrapper";
import { ThemedView } from "@/components/themed-view";
import menuData from "@/mockupData/menuData.json";
import optionData from "@/mockupData/optionGroup.json";

const SPACING = { sm: 8, md: 12, lg: 16, xl: 20 };
interface MenuItem {
  id: string;
  name: string;
  basePrice: number;
  leftoverQty: number;
  photoUrl: string;
  categoryName?: string | null;
}

interface Option {
  id: string;
  optionGroupId: string;
  name: string;
  active: boolean;
  priceDelta: number;
  sortOrder: number;
}

interface OptionGroup {
  id: string;
  menuItemId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: Option[];
}


interface Section {
  id: string;
  title: string;
  items: MenuItem[];
}

const groupByCategory = (items: MenuItem[]): Section[] => {
  const map = new Map<string, Section>();
  const UNCATEGORIZED = "Uncategorized";

  items.forEach((m) => {
    const title = m.categoryName?.trim() || "Food" || UNCATEGORIZED;
    if (!map.has(title)) map.set(title, { id: title, title, items: [] });
    map.get(title)!.items.push(m);
  });

  return Array.from(map.values()).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
};

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"items" | "options">("items");

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05;
    return Math.max(14, Math.min(pct, 24));
  }, [screenWidth]);

  const sections = useMemo(
    () => groupByCategory((menuData.menuItems as MenuItem[]) || []),
    []
  );
  const optionGroups = optionData.optionGroups as OptionGroup[];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
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

      <View style={styles.screen}>
        {sections.map((item, idx) => (
          <React.Fragment key={item.id}>
            <ThemedView
              style={[styles.wrapperRow, { paddingHorizontal: horizontalPadding }]}
            >
              {tab === "items" ? (
                
                <MenuWrapper
                  title={item.title}
                  items={item.items.map((m) => ({
                    id: m.id,
                    name: m.name,
                    price: m.basePrice,
                    imageUrl: m.photoUrl,
                    inStock: (m.leftoverQty ?? 0) > 0,
                  }))}
                  defaultExpanded
                  onToggleItem={(id, val) =>
                    console.log(`[${item.title}] toggle ${id}: ${val}`)
                  }
                />
              ) : (
                <View>
                  {optionGroups.map((group) => {
                    return (
                      <OptionWrapper
                        key={group.id}
                        title={group.name}
                        options={group.options}
                        defaultExpanded
                        onChangeChoice={(groupId, choiceId, val) =>
                          console.log(
                            `[${group.name}] [${groupId}] choice ${choiceId} = ${val}`
                          )
                        }
                      />
                    );
                  })}
                </View>
              )}
            </ThemedView>
            {idx < sections.length - 1 && (
              <View style={{ height: SPACING.lg }} />
            )}
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
