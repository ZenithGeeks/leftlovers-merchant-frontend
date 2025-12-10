// app/(pages)/edit-store-contact.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";

import { ThemedView } from "@/components/themed-view";
import FieldLabel from "@/components/add-item/FieldLabel";
import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/store";
import { DEV_MERCHANT_ID } from "@/utils/env";

const MERCHANT_ID =
  DEV_MERCHANT_ID || process.env.EXPO_PUBLIC_MERCHANT_ID || "";

export default function EditStoreContact() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [storePhone, setStorePhone] = useState("");
  const [initialStorePhone, setInitialStorePhone] = useState("");

  const horizontalPadding = 20;

  // ------- Load current store contact from backend -------
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
        const data: StoreSettings = await fetchStoreSettings(MERCHANT_ID);
        if (cancelled) return;

        // Prefer contact.storePhone, fallback to owner.phone
        const phone =
          data.contact?.storePhone ??
          data.owner?.phone ??
          "";

        setStorePhone(phone);
        setInitialStorePhone(phone);
      } catch (e: any) {
        if (cancelled) return;
        console.error("Failed to load store contact:", e);
        const msg = e?.message ?? "Failed to load store contact.";
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

  const hasChanges = storePhone.trim() !== initialStorePhone.trim();

  const canSave = useMemo(
    () => storePhone.trim().length > 0 && hasChanges && !saving,
    [storePhone, hasChanges, saving]
  );

  const onSave = async () => {
    if (!canSave || !MERCHANT_ID) return;

    setSaving(true);
    try {
      // 🔥 Use ownerPhone, same as EditOwnerContact → backend already supports this
      await updateStoreSettings(MERCHANT_ID, {
        ownerPhone: storePhone.trim(),
      });

      setInitialStorePhone(storePhone.trim());

      Alert.alert("Success", "Store contact number updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error("Save store contact failed:", e);
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
        <Text className="mt-2 text-gray-500">Loading store contact…</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View className="px-5 pb-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="back"
          className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="text-2xl font-bold text-[#11181C]">
          Edit Store Details
        </Text>
        <Pressable onPress={() => router.back()} accessibilityLabel="close">
          <XMarkIcon size={22} color="#11181C" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 0 })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
              <Text className="text-red-600 text-[14px]">{error}</Text>
            </View>
          )}

          {/* Store contact number */}
          <FieldLabel
            className="pb-2 pt-6"
            label="Store contact number"
            required
          />
          <TextInput
            placeholder="+66 ___ ___ ____"
            value={storePhone}
            onChangeText={setStorePhone}
            keyboardType="phone-pad"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
          />
        </ScrollView>

        {/* Floating Save button */}
        <View
          className="absolute left-0 right-0"
          style={{ bottom: insets.bottom + 20 }}
        >
          <View className="px-5">
            <Pressable
              onPress={onSave}
              accessibilityLabel="save-contact"
              accessibilityState={{ disabled: !canSave }}
              disabled={!canSave}
              className={`w-full rounded-2xl py-4 items-center justify-center ${
                canSave ? "bg-[#26BD68]" : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-[16px] font-semibold">
                {saving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
