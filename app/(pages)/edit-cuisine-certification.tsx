// app/(page)/edit-cuisine-certification.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import FieldLabel from "@/components/add-item/FieldLabel";
import { ChevronLeftIcon } from "react-native-heroicons/outline";

import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/store";
import { fetchCategories, type Category } from "@/services/category";
import { DEV_MERCHANT_ID } from "@/utils/env";

const MERCHANT_ID =
  DEV_MERCHANT_ID || process.env.EXPO_PUBLIC_MERCHANT_ID || "";

export default function EditCuisineCertification() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [initialCategoryId, setInitialCategoryId] = useState<string | null>(null);

  // -------- Load categories + store (for current category) --------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!MERCHANT_ID) {
        setError("Missing merchant id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1) Load categories
        const cats = await fetchCategories();
        if (cancelled) return;
        setCategories(cats ?? []);

        // 2) Load store settings (for current category)
        const store: StoreSettings = await fetchStoreSettings(MERCHANT_ID);
        if (cancelled) return;

        const currCategoryId =
          store.cuisine?.categoryId ??
          // fallback if your backend later exposes this directly
          (store as any).categoryId ??
          "";

        setSelectedCategoryId(currCategoryId || "");
        setInitialCategoryId(currCategoryId || null);
      } catch (e: any) {
        if (cancelled) return;
        console.error("Failed to load cuisine settings:", e);
        const msg = e?.message ?? "Failed to load cuisine information.";
        setError(msg);
        Alert.alert("Error", msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) ?? null;

  const hasChanges = selectedCategoryId !== (initialCategoryId ?? "");

  const canSave = useMemo(
    () => !!selectedCategoryId && !saving && hasChanges,
    [selectedCategoryId, saving, hasChanges]
  );

  const onSave = async () => {
    if (!canSave || !MERCHANT_ID) return;

    setSaving(true);
    try {
      // Only update categoryId via existing /merchant/:id/editstore endpoint
      await updateStoreSettings(MERCHANT_ID, {
        categoryId: selectedCategoryId,
      });

      setInitialCategoryId(selectedCategoryId);

      Alert.alert("Success", "Cuisine updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error("Save cuisine settings failed:", e);
      Alert.alert("Save failed", e?.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator />
        <Text className="mt-2 text-gray-500">Loading cuisine settings…</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >
      {/* Header */}
      <View className="px-5 pb-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="text-2xl font-bold text-[#11181C]">
          Edit Cuisine & Certification
        </Text>
        {/* spacer to keep title centered */}
        <View className="w-9 h-9" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {error && (
          <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
            <Text className="text-red-600 text-[14px]">{error}</Text>
          </View>
        )}

        {/* Cuisine Type (category dropdown-style list) */}
        <FieldLabel label="Cuisine Type" className="pb-2 pt-4" required />
        {categories.length === 0 ? (
          <Text className="text-gray-500 mb-3">
            No categories configured. Please contact admin.
          </Text>
        ) : (
          <View className="mb-4">
            {/* Display-style selected box */}
            <Pressable
              className="w-full rounded-xl border border-gray-300 px-4 py-3 flex-row justify-between items-center"
              onPress={() => {
                // selection happens in the list below
              }}
            >
              <Text className="text-[16px] text-[#11181C]">
                {selectedCategory
                  ? selectedCategory.name
                  : "Select cuisine category"}
              </Text>
            </Pressable>

            {/* Simple list of categories to choose from */}
            <View className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
              {categories.map((cat) => {
                const active = cat.id === selectedCategoryId;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 flex-row items-center justify-between ${
                      active ? "bg-emerald-50" : "bg-white"
                    }`}
                  >
                    <Text className="text-[15px] text-[#11181C]">
                      {cat.name}
                    </Text>
                    {active && (
                      <Text className="text-emerald-600 text-[13px]">
                        Selected
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Certification – just show "Verified" (no upload) */}
        <FieldLabel label="Certification" className="pb-2 pt-6" />
        <View className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 flex-row items-center justify-between">
          <View>
            <Text className="text-[14px] text-emerald-700 font-semibold">
              Certification status
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-emerald-600">
            <Text className="text-[12px] text-white font-semibold">
              Verified
            </Text>
          </View>
        </View>

        {/* Save */}
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          accessibilityLabel="save-cuisine-certification"
          accessibilityState={{ disabled: !canSave }}
          className={`mt-10 w-full rounded-2xl py-4 items-center ${
            canSave ? "bg-[#26BD68]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-[16px] font-semibold">
            {saving ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
