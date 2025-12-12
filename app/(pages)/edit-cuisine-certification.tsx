// app/(page)/edit-cuisine-certification.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/store";
import { fetchCategories, type Category } from "@/services/category";

import StoreHeader from "@/components/store/StoreHeader";
import CuisineCertificationForm from "@/components/store/CuisineCertificationForm";

type EditCuisineParams = { merchantId?: string };

export default function EditCuisineCertification() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<EditCuisineParams>();
  const merchantId = params.merchantId ?? "";

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
      if (!merchantId) {
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
        const store: StoreSettings = await fetchStoreSettings(merchantId);
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
  }, [merchantId]);

  const hasChanges = selectedCategoryId !== (initialCategoryId ?? "");

  const canSave = useMemo(
    () => !!merchantId && !!selectedCategoryId && !saving && hasChanges,
    [merchantId, selectedCategoryId, saving, hasChanges]
  );

  const onSave = async () => {
    if (!canSave || !merchantId) return;

    setSaving(true);
    try {
      // Only update categoryId via existing /merchant/:id/editstore endpoint
      await updateStoreSettings(merchantId, {
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

  if (!merchantId) {
    return (
      <ThemedView
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-red-600 mb-2 font-semibold">
          Missing merchant id
        </Text>
        <Text className="text-gray-500 text-center px-6">
          This screen must be opened with a merchantId param.
        </Text>
      </ThemedView>
    );
  }

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
