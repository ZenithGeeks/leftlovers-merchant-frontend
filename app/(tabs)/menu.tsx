import ContentSwitcher from "@/components/Menu/Content-Switcher";
import MenuWrapper from "@/components/Menu/Menu-Wrapper";
import OptionWrapper from "@/components/Menu/Option-Wrapper";
import { ThemedView } from "@/components/themed-view";
import React, { useMemo, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Fab from "@/components/common/Fab";
import AddSheet from "@/components/Menu/AddSheet";
import menuData from "@/mockupData/menuData.json";
import optionData from "@/mockupData/optionGroup.json";
import { useRouter } from "expo-router";

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
  items.forEach((m) => {
    const title = "Menu";
    if (!map.has(title)) map.set(title, { id: title, title, items: [] });
    map.get(title)!.items.push(m);
  });

  return Array.from(map.values()).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
};

export default function MenuScreen() {
  const [addOpen, setAddOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"items" | "options">("items");
  const router = useRouter();
  const handleAddItem = () => {
    router.push("/add-item");
    setAddOpen(false);
  };
  const handleAddOption = () => {
    router.push("/add-option");
    setAddOpen(false);
  };

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
    <View>
      <ScrollView
        className="h-full"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView
          className="flex-1"
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: horizontalPadding,
          }}
        >
          {/* Header */}
          <View className="mb-6 gap-3">
            <Text className="text-3xl font-bold text-[#11181C]">Menu</Text>
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

        {/* Menu Sections */}
        <View className="flex-1">
          {sections.map((section, idx) => (
            <React.Fragment key={section.id}>
              <ThemedView
                className="w-full"
                style={{ paddingHorizontal: horizontalPadding }}
              >
                {tab === "items" ? (
                  <MenuWrapper
                    title={section.title}
                    items={section.items.map((m) => ({
                      id: m.id,
                      name: m.name,
                      price: m.basePrice,
                      imageUrl: m.photoUrl,
                      inStock: (m.leftoverQty ?? 0) > 0,
                    }))}
                    defaultExpanded
                    onToggleItem={(id, val) =>
                      console.log(`[${section.title}] toggle ${id}: ${val}`)
                    }
                  />
                ) : (
                  <View className="gap-3">
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

              {idx < sections.length - 1 && <View className="h-4" />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
      <Fab onPress={() => setAddOpen(true)} />
      <AddSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onAddItem={handleAddItem}
        onAddOption={handleAddOption}
      />
    </View>
  );
}
