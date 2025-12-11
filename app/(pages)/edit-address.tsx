// app/(pages)/edit-address.tsx
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
import { ChevronLeftIcon } from "react-native-heroicons/outline";

import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import LocationPicker from "@/components/Authen/LocationPicker.native";

import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/store";
import { DEV_MERCHANT_ID } from "@/utils/env";

const MERCHANT_ID =
  DEV_MERCHANT_ID || process.env.EXPO_PUBLIC_MERCHANT_ID || "";

// same helpers as LocationPicker uses
const isValidLat = (v: string) =>
  v !== "" && !isNaN(Number(v)) && Math.abs(Number(v)) <= 90;
const isValidLng = (v: string) =>
  v !== "" && !isNaN(Number(v)) && Math.abs(Number(v)) <= 180;

export default function EditAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- form state ----
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // 🔹 location state (string for UI)
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // ---- initial values for change detection ----
  const [initialLine1, setInitialLine1] = useState("");
  const [initialLine2, setInitialLine2] = useState("");
  const [initialCity, setInitialCity] = useState("");
  const [initialProvince, setInitialProvince] = useState("");
  const [initialPostalCode, setInitialPostalCode] = useState("");

  const [initialLat, setInitialLat] = useState("");
  const [initialLng, setInitialLng] = useState("");

  // -------- Load address from backend via /merchant/:id/editstore --------
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

        const addr =
          data.address ?? ({
            line1: "",
            line2: "",
            city: "",
            province: "",
            postalCode: "",
            lat: null,
            lng: null,
          } as any);

        const l1 = addr.line1 ?? "";
        const l2 = addr.line2 ?? "";
        const c = addr.city ?? "";
        const p = addr.province ?? "";
        const pc = addr.postalCode ?? "";

        // 🔹 numbers from backend → strings for UI
        const latVal =
          addr.lat !== null && addr.lat !== undefined
            ? String(addr.lat)
            : "";
        const lngVal =
          addr.lng !== null && addr.lng !== undefined
            ? String(addr.lng)
            : "";

        setLine1(l1);
        setLine2(l2);
        setCity(c);
        setProvince(p);
        setPostalCode(pc);
        setLat(latVal);
        setLng(lngVal);

        setInitialLine1(l1);
        setInitialLine2(l2);
        setInitialCity(c);
        setInitialProvince(p);
        setInitialPostalCode(pc);
        setInitialLat(latVal);
        setInitialLng(lngVal);
      } catch (e: any) {
        if (cancelled) return;
        console.error("Failed to load address:", e);
        const msg = e?.message ?? "Failed to load address.";
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
    line1.trim() !== initialLine1.trim() ||
    line2.trim() !== initialLine2.trim() ||
    city.trim() !== initialCity.trim() ||
    province.trim() !== initialProvince.trim() ||
    postalCode.trim() !== initialPostalCode.trim() ||
    lat.trim() !== initialLat.trim() ||
    lng.trim() !== initialLng.trim();

  const canSave = useMemo(
    () =>
      line1.trim().length > 0 &&
      hasChanges &&
      !saving &&
      isValidLat(lat) &&
      isValidLng(lng),
    [line1, hasChanges, saving, lat, lng]
  );

  const onSave = async () => {
    if (!canSave || !MERCHANT_ID) return;

    setSaving(true);
    try {
      await updateStoreSettings(MERCHANT_ID, {
        address: {
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim() || undefined,
          province: province.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          // 🔹 strings → numbers for backend (Decimal)
          lat: lat.trim() ? Number(lat.trim()) : undefined,
          lng: lng.trim() ? Number(lng.trim()) : undefined,
        },
      });

      setInitialLine1(line1.trim());
      setInitialLine2(line2.trim());
      setInitialCity(city.trim());
      setInitialProvince(province.trim());
      setInitialPostalCode(postalCode.trim());
      setInitialLat(lat.trim());
      setInitialLng(lng.trim());

      Alert.alert("Success", "Address updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error("Save address failed:", e);
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
        <Text className="mt-2 text-gray-500">Loading address…</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >
      {/* Header */}
      <View className="px-5 pb-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="back"
          className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text
          className="ml-3 text-2xl font-bold text-[#11181C]"
          style={{ fontFamily: Fonts.bold }}
        >
          Edit Address
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
            <Text className="text-red-600 text-[14px]">{error}</Text>
          </View>
        )}

        {/* 🔹 Location picker (lat,lng) */}
        <View className="mt-4">
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
            }}
          />
        </View>

        {/* Line 1 (required) */}
        <View className="mt-5">
          <Text className="text-[16px] font-semibold text-[#11181C]">
            Address Line 1 <Text className="text-[#EF4444]">*</Text>
          </Text>
          <TextInput
            value={line1}
            onChangeText={setLine1}
            placeholder="Street, building, house no."
            placeholderTextColor="#9AA0A6"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
          />
        </View>

        {/* Line 2 (optional) */}
        <View className="mt-5">
          <Text className="text-[16px] font-semibold text-[#11181C]">
            Address Line 2 (optional)
          </Text>
          <TextInput
            value={line2}
            onChangeText={setLine2}
            placeholder="Apartment, floor, unit"
            placeholderTextColor="#9AA0A6"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
          />
        </View>

        {/* City & Province */}
        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <Text className="text-[16px] font-semibold text-[#11181C]">
              City
            </Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="e.g., Bangkok"
              placeholderTextColor="#9AA0A6"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[16px] font-semibold text-[#11181C]">
              Province
            </Text>
            <TextInput
              value={province}
              onChangeText={setProvince}
              placeholder="e.g., Bangkok"
              placeholderTextColor="#9AA0A6"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
            />
          </View>
        </View>

        {/* Postal code */}
        <View className="mt-5">
          <Text className="text-[16px] font-semibold text-[#11181C]">
            Postal Code
          </Text>
          <TextInput
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="number-pad"
            placeholder="e.g., 10140"
            placeholderTextColor="#9AA0A6"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
          />
        </View>

        {/* Save */}
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          accessibilityLabel="save-address"
          accessibilityState={{ disabled: !canSave }}
          className={`mt-8 w-full rounded-2xl py-4 items-center justify-center ${
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
