// app/(page)/edit-cuisine-certification.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import FieldLabel from "@/components/add-item/FieldLabel";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";

import { httpGet, putJSON } from "@/lib/api";
import { DEV_MERCHANT_ID } from "@/utils/env";

// ---- Types that match /merchant/:merchantId/editstore GET response ----
type StoreSettingsAPI = {
  id: string;
  name: string;
  cuisine: {
    categoryId: string | null;
    type: string | null;
    certification: string | null;
  };
  // we don't need the rest here, so keep them optional
};

const MERCHANT_ID =
  DEV_MERCHANT_ID || process.env.EXPO_PUBLIC_MERCHANT_ID || "";

export default function EditCuisineCertification() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cuisine, setCuisine] = useState("");
  const [certification, setCertification] = useState("");

  // keep initial values so we know if anything changed
  const [initialCuisine, setInitialCuisine] = useState("");
  const [initialCertification, setInitialCertification] = useState("");

  // -------- Load current settings from backend --------
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
        const data = await httpGet<StoreSettingsAPI>(
          `/merchant/${MERCHANT_ID}/editstore`
        );

        if (cancelled) return;

        const currCuisine = data.cuisine?.type ?? "";
        const currCert = data.cuisine?.certification ?? "";

        setCuisine(currCuisine);
        setCertification(currCert);

        setInitialCuisine(currCuisine);
        setInitialCertification(currCert);
      } catch (e: any) {
        if (cancelled) return;
        console.error("Failed to load cuisine settings:", e);
        const msg = e?.message ?? "Failed to load current settings.";
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

  const hasChanges =
    cuisine.trim() !== initialCuisine.trim() ||
    certification.trim() !== initialCertification.trim();

  const canSave = useMemo(
    () => cuisine.trim().length > 0 && !saving && hasChanges,
    [cuisine, saving, hasChanges]
  );

  // -------- Save handler --------
  const onSave = async () => {
    if (!canSave || !MERCHANT_ID) return;

    setSaving(true);
    try {
      await putJSON(`/merchant/${MERCHANT_ID}/editstore`, {
        cuisine: {
          type: cuisine.trim(),
          certification: certification.trim() || null,
        },
      });

      setInitialCuisine(cuisine.trim());
      setInitialCertification(certification.trim());

      Alert.alert("Success", "Cuisine & certification updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error("Save cuisine settings failed:", e);
      Alert.alert("Save failed", e?.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // -------- Loading state --------
  if (loading) {
    return (
      <ThemedView
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator />
        <Text className="mt-2 text-gray-500">Loading current settings…</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8 }}
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
        <Pressable onPress={() => router.back()}>
          <XMarkIcon size={22} color="#11181C" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error && (
          <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
            <Text className="text-red-600 text-[14px]">{error}</Text>
          </View>
        )}

        <FieldLabel label="Cuisine Type" className="pb-2 pt-4" required />
        <TextInput
          placeholder="e.g. Thai, Japanese, Bakery"
          value={cuisine}
          onChangeText={setCuisine}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        <FieldLabel label="Certification" className="pb-2 pt-6" />
        <TextInput
          placeholder="e.g. Halal, Clean Food Good Taste"
          value={certification}
          onChangeText={setCertification}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

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
