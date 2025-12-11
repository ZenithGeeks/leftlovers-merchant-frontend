import Fab from "@/components/common/Fab";
import AddSheet from "@/components/Menu/AddSheet";
import ContentSwitcher from "@/components/Menu/Content-Switcher";
import MenuWrapper from "@/components/Menu/Menu-Wrapper";
import OptionWrapper from "@/components/Menu/Option-Wrapper";
import { ThemedView } from "@/components/themed-view";
import { useMerchant } from "@/context/MerchantContext";
import {
  fetchMerchantOptionGroups,
  type OptionGroupAPI,
} from "@/services/group";
import { getMenuItems } from "@/services/menu";
import type { MenuItemAPI } from "@/types/types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = "items" | "options";
type Section = { id: string; title: string; items: MenuItemAPI[] };

const groupByCategory = (items: MenuItemAPI[]): Section[] => [
  { id: "List", title: "List", items },
];

const isNoDataError = (msg: string) => {
  const lower = msg.toLowerCase();
  return (
    lower.includes("no groups found") ||
    lower.includes("no menu") ||
    lower.includes("no items found")
  );
};

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("items");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menu, setMenu] = useState<MenuItemAPI[]>([]);
  const [groups, setGroups] = useState<OptionGroupAPI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { merchantId } = useMerchant();
  const horizontalPadding = useMemo(
    () => Math.max(16, Math.min(width * 0.05, 28)),
    [width]
  );

  const fetchAll = useCallback(async () => {
    if (!merchantId) {
      router.replace("/(auth)/signin");
      setMenu([]);
      setGroups([]);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [menuResult, groupResult] = await Promise.allSettled([
        getMenuItems(merchantId),
        fetchMerchantOptionGroups(merchantId),
      ]);
      if (menuResult.status === "fulfilled") {
        setMenu(menuResult.value ?? []);
      } else {
        const msg =
          menuResult.reason?.message ?? String(menuResult.reason ?? "");
        if (isNoDataError(msg)) {
          setMenu([]); // just empty, not an error
        } else {
          setError(msg || "Failed to load menu.");
        }
      }

      // Groups
      if (groupResult.status === "fulfilled") {
        setGroups(groupResult.value ?? []);
      } else {
        const msg =
          groupResult.reason?.message ?? String(groupResult.reason ?? "");
        if (isNoDataError(msg)) {
          setGroups([]); // no groups yet, normal
        } else if (!error) {
          // only set error if we don't have one already
          setError(msg || "Failed to load option groups.");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [merchantId, router, error]);

  const onRefresh = useCallback(async () => {

    setRefreshing(true);
    setError(null);

    try {

      const [menuResult, groupResult] = await Promise.allSettled([
        getMenuItems(merchantId!),
        fetchMerchantOptionGroups(merchantId!),
      ]);

      if (menuResult.status === "fulfilled") {
        setMenu(menuResult.value ?? []);
      } else {
        const msg =
          menuResult.reason?.message ?? String(menuResult.reason ?? "");
        if (isNoDataError(msg)) {
          setMenu([]);
        } else {
          setError(msg || "Failed to refresh menu.");
        }
      }

      if (groupResult.status === "fulfilled") {
        setGroups(groupResult.value ?? []);
      } else {
        const msg =
          groupResult.reason?.message ?? String(groupResult.reason ?? "");
        if (isNoDataError(msg)) {
          setGroups([]);
        } else if (!error) {
          setError(msg || "Failed to refresh option groups.");
        }
      }
    } finally {
      setRefreshing(false);
    }
  }, [merchantId, error]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  const sections = useMemo(() => groupByCategory(menu), [menu]);

  const handleAddItem = () => router.push({
    pathname: "/add-item",
    params: { merchantId },
  });
  const handleAddOption = () =>   router.push({
    pathname: "/add-option",
    params: { merchantId },
  });

  if (!merchantId) {
    return (
      <ThemedView className="flex-1 bg-[#F7F8FA] justify-center items-center px-6">
        <Text className="text-base text-gray-700">Missing merchant id</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1 bg-[#F7F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
              onChange={(k) => setTab(k as TabKey)}
            />
          </View>
        </ThemedView>

        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator />
            <Text className="mt-2 text-gray-600">Loading…</Text>
          </View>
        ) : error ? (
          <View
            className="rounded-2xl border border-red-200 bg-red-50 p-4"
            style={{ marginHorizontal: horizontalPadding }}
          >
            <Text className="font-semibold text-red-700">Error</Text>
            <Text className="mt-1 text-red-700">{error}</Text>
            <Pressable onPress={fetchAll} className="mt-3">
              <Text className="font-semibold text-[#26BD68]">Tap to retry</Text>
            </Pressable>
          </View>
        ) : (
          <ThemedView
            className="w-full"
            style={{ paddingHorizontal: horizontalPadding }}
          >
            {tab === "items" ? (
              sections[0]?.items.length ? (
                sections.map((section) => (
                  <View key={section.id} className="mb-10">
                    <MenuWrapper
                      title={section.title}
                      merchantId={merchantId}
                      items={section.items}
                      defaultExpanded
                      onToggleItem={onRefresh}
                    />
                  </View>
                ))
              ) : (
                <View className="rounded-2xl border border-gray-200 bg-white p-6">
                  <Text className="text-gray-600">
                    No items yet. Use the + button to add your first item.
                  </Text>
                </View>
              )
            ) : groups.length ? (
              <View className="mb-10 gap-4">
                {groups.map((group) => (
                  <OptionWrapper
                    key={group.id}
                    merchantId={merchantId}
                    groupId={group.id}
                    title={group.name}
                    options={group.options}
                    defaultExpanded
                    maxSelect={group.maxSelect}
                    onAfterChange={onRefresh}
                  />
                ))}
              </View>
            ) : (
              <View className="rounded-2xl border border-gray-200 bg-white p-6">
                <Text className="text-gray-600">
                  No option groups. Use the + button to add.
                </Text>
              </View>
            )}
          </ThemedView>
        )}
      </ScrollView>

      <Fab onPress={() => setAddOpen(true)} testID="fab" />

      <AddSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onAddItem={handleAddItem}
        onAddOption={handleAddOption}
      />
    </ThemedView>
  );
}
