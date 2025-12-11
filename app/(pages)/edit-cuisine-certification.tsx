// app/(page)/edit-cuisine-certification.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/store";
import { fetchCategories, type Category } from "@/services/category";
import { DEV_MERCHANT_ID } from "@/utils/env";

import StoreHeader from "@/components/store/StoreHeader";
import CuisineCertificationForm from "@/components/store/CuisineCertificationForm";

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

  const [initialCategoryId, setInitialCategoryId] = useState<string | null>(
    null
  );

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
        <Text className="mt-2 text-gray-500">
          Loading cuisine settings…
        </Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >
      {/* Header */}
      <StoreHeader
        title="Edit Cuisine & Certification"
        onBack={() => router.back()}
      />

      {/* Form */}
      <CuisineCertificationForm
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        canSave={canSave}
        saving={saving}
        onSave={onSave}
        error={error}
        bottomPadding={insets.bottom}
      />
    </ThemedView>
  );
}
