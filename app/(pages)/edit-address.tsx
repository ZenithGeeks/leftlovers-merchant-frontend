// app/(pages)/edit-address.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import StoreHeader from "@/components/store/StoreHeader";
import AddressForm from "@/components/store/AddressForm";

import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/store";

// same helpers as LocationPicker uses
const isValidLat = (v: string) =>
  v !== "" && !isNaN(Number(v)) && Math.abs(Number(v)) <= 90;
const isValidLng = (v: string) =>
  v !== "" && !isNaN(Number(v)) && Math.abs(Number(v)) <= 180;

type EditAddressParams = { merchantId?: string };

export default function EditAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<EditAddressParams>();
  const merchantId = params.merchantId ?? "";

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
      if (!merchantId) {
        setError("Missing merchant id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data: StoreSettings = await fetchStoreSettings(merchantId);
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
          addr.lat !== null && addr.lat !== undefined ? String(addr.lat) : "";
        const lngVal =
          addr.lng !== null && addr.lng !== undefined ? String(addr.lng) : "";

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
  }, [merchantId]);

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
      !!merchantId &&
      line1.trim().length > 0 &&
      hasChanges &&
      !saving &&
      isValidLat(lat) &&
      isValidLng(lng),
    [merchantId, line1, hasChanges, saving, lat, lng]
  );

  const onSave = async () => {
    if (!canSave || !merchantId) return;

    setSaving(true);
    try {
      await updateStoreSettings(merchantId, {
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
        <Text className="mt-2 text-gray-500">Loading address…</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >
      <StoreHeader title="Edit Address" onBack={() => router.back()} />

      <AddressForm
        error={error}
        line1={line1}
        setLine1={setLine1}
        line2={line2}
        setLine2={setLine2}
        city={city}
        setCity={setCity}
        province={province}
        setProvince={setProvince}
        postalCode={postalCode}
        setPostalCode={setPostalCode}
        lat={lat}
        lng={lng}
        setLat={setLat}
        setLng={setLng}
        canSave={canSave}
        saving={saving}
        onSave={onSave}
        bottomPadding={insets.bottom}
      />
    </ThemedView>
  );
}
