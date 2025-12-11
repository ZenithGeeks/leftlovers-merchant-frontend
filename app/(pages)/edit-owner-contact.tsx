// app/(pages)/edit-owner-contact.tsx
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
import { DEV_MERCHANT_ID } from "@/utils/env";

import StoreHeader from "@/components/store/StoreHeader";
import OwnerContactForm from "@/components/store/OwnerContactForm";

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
      // Only update OWNER contact
      await updateStoreSettings(MERCHANT_ID, {
        ownerPhone: phone.trim(),
        ownerEmail: email.trim().toLowerCase(),
      });

      setInitialPhone(phone.trim());
      setInitialEmail(email.trim().toLowerCase());

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
      <StoreHeader
        title="Edit Owner’s Contact"
        onBack={() => router.back()}
      />

      {/* Form */}
      <OwnerContactForm
        phone={phone}
        setPhone={setPhone}
        email={email}
        setEmail={setEmail}
        canSave={canSave}
        saving={saving}
        onSave={onSave}
        error={error}
        bottomPadding={insets.bottom}
      />
    </ThemedView>
  );
}
