// app/(tabs)/menu.tsx (or your screen file)
import Fab from "@/components/common/Fab";
import AddSheet from "@/components/Menu/AddSheet";
import ContentSwitcher from "@/components/Menu/Content-Switcher";
import MenuWrapper from "@/components/Menu/Menu-Wrapper";
import OptionWrapper from "@/components/Menu/Option-Wrapper";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import menuData from "@/mockupData/menuData.json";
import optionData from "@/mockupData/optionGroup.json";

interface MenuItem {
  id: string;
  name: string;
  basePrice: number;
  leftoverQty: number;
  photoUrl: string;
  categoryName?: string | null;
}
interface Option { id: string; optionGroupId: string; name: string; active: boolean; priceDelta: number; sortOrder: number; }
interface OptionGroup {
  id: string; menuItemId: string; name: string; minSelect: number; maxSelect: number; sortOrder: number; options: Option[];
}
interface Section { id: string; title: string; items: MenuItem[]; }

const groupByCategory = (items: MenuItem[]): Section[] => {
  const title = "Menu";
  return [{ id: title, title, items }];
};

export default function MenuScreen() {
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState<"items" | "options">("items");

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05; // 5% gutter
    return Math.max(16, Math.min(pct, 28));
  }, [screenWidth]);

  const sections = useMemo(
    () => groupByCategory((menuData.menuItems as MenuItem[]) || []),
    []
  );
  const optionGroups = optionData.optionGroups as OptionGroup[];

  const handleAddItem = () => router.push("/add-item");
  const handleAddOption = () => router.push("/add-option");

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <ThemedView
          className="w-full"
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View className="mb-6 gap-3">
            <Text className="text-[36px] font-extrabold text-[#0B1220]">
              Menu
            </Text>
            <ContentSwitcher
              tabs={[
                { key: "items", label: "Items" },
                { key: "options", label: "Options" },
              ]}
              value={tab}
              onChange={(k) => setTab(k as "items" | "options")}
            />
          </View>
        </ThemedView>

        {/* Sections */}
        <ThemedView
          className="w-full"
          style={{ paddingHorizontal: horizontalPadding }}
        >
          {tab === "items" ? (
            sections.map((section) => (
              <View key={section.id} className="mb-10">
                <MenuWrapper
                  title={section.title}
                  items={section.items.map((m) => ({
                    id: m.id,
                    name: m.name,
                    price: m.basePrice,
                    imageUrl: m.photoUrl,
                    inStock: (m.leftoverQty ?? 0) > 0,
                    leftoverQty: m.leftoverQty
                  }))}
                  defaultExpanded
                  onToggleItem={(id, val) =>
                    console.log(`[${section.title}] toggle ${id}: ${val}`)
                  }
                />
              </View>
            ))
          ) : (
            <View className="mb-10 gap-4">
              {optionGroups.map((group) => (
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
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* Floating Action Button */}
      <Fab onPress={() => setAddOpen(true)} />

      {/* Action Sheet */}
      <AddSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onAddItem={handleAddItem}
        onAddOption={handleAddOption}
      />
    </View>
  );
}
