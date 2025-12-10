// app/(pages)/edit-owner-contact.tsx
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

export default function EditOwnerContact() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [initialPhone, setInitialPhone] = useState("");
  const [initialEmail, setInitialEmail] = useState("");

  // ---------- Load current owner contact from backend ----------
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

        const ownerPhone = data.owner?.phone ?? "";
        const ownerEmail = data.owner?.email ?? "";

        setPhone(ownerPhone);
        setEmail(ownerEmail);

        setInitialPhone(ownerPhone);
        setInitialEmail(ownerEmail);
      } catch (e: any) {
        if (cancelled) return;
        console.error("Failed to load owner contact:", e);
        const msg = e?.message ?? "Failed to load owner contact.";
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
    phone.trim() !== initialPhone.trim() ||
    email.trim() !== initialEmail.trim();

  const canSave = useMemo(
    () =>
      phone.trim().length > 0 &&
      email.trim().length > 0 &&
      hasChanges &&
      !saving,
    [phone, email, hasChanges, saving]
  );

  const onSave = async () => {
    if (!canSave || !MERCHANT_ID) return;

    setSaving(true);
    try {
      await updateStoreSettings(MERCHANT_ID, {
        ownerPhone: phone.trim(),
        ownerEmail: email.trim(),
      });

      setInitialPhone(phone.trim());
      setInitialEmail(email.trim());

      Alert.alert("Success", "Owner contact updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error("Save owner contact failed:", e);
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
        <Text className="mt-2 text-gray-500">Loading owner contact…</Text>
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
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="text-2xl font-bold text-[#11181C]">
          Edit Owner’s Contact
        </Text>
        <Pressable onPress={() => router.back()}>
          <XMarkIcon size={22} color="#11181C" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {error && (
          <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
            <Text className="text-red-600 text-[14px]">{error}</Text>
          </View>
        )}

        <FieldLabel
          label="Owner’s Mobile Number"
          className="pb-2 pt-4"
          required
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="Enter owner mobile number"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        <FieldLabel label="Owner’s Email" className="pb-2 pt-6" required />
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter owner email"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        <Pressable
          onPress={onSave}
          disabled={!canSave}
          accessibilityLabel="save-owner-contact"
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
