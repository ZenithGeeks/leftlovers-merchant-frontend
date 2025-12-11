// app/(pages)/edit-store-detail.tsx
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
import { DEV_MERCHANT_ID } from "@/utils/env";
import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/store";

import StoreHeader from "@/components/store/StoreHeader";
import StoreNameField from "@/components/store/StoreNameField";
import StoreImagePickerSection from "@/components/store/StoreImagePickerSection";

const MERCHANT_ID =
  DEV_MERCHANT_ID || process.env.EXPO_PUBLIC_MERCHANT_ID || "";

const RAW_API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://backend-leftlovers-production.up.railway.app";

// trim trailing slashes so we don’t get //api/...
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "");

async function uploadToMinio(uri: string, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: "store-image.jpg",
    type: "image/jpeg",
  } as any);

  const res = await fetch(
    `${API_BASE_URL}/api/minio/upload?folder=${encodeURIComponent(folder)}`,
    {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${txt}`);
  }

  const json = (await res.json()) as { url: string };
  return json.url;
}

export default function EditStoreDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [storeImage, setStoreImage] = useState<string | null>(null);
  const [listImage, setListImage] = useState<string | null>(null);

  const [initialName, setInitialName] = useState("");
  const [initialStoreImage, setInitialStoreImage] = useState<string | null>(
    null
  );
  const [initialListImage, setInitialListImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!MERCHANT_ID) {
        Alert.alert("Error", "Missing merchant id.");
        return;
      }
      try {
        setLoading(true);
        const data: StoreSettings = await fetchStoreSettings(MERCHANT_ID);
        if (cancelled) return;

        const name = data.name ?? "";
        setStoreName(name);
        setInitialName(name);

        const storeImg = data.storeImage ?? null;
        const listImg = data.listImage ?? null;

        setStoreImage(storeImg);
        setListImage(listImg);
        setInitialStoreImage(storeImg);
        setInitialListImage(listImg);
      } catch (e: any) {
        if (!cancelled) {
          console.error("Failed to load store detail:", e);
          Alert.alert("Error", e?.message ?? "Failed to load store details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSave = useMemo(
    () => storeName.trim().length > 0 && !submitting,
    [storeName, submitting]
  );

  const isLocalFileUri = (uri: string | null): boolean =>
    !!uri && uri.startsWith("file://");

  const onSave = async () => {
    if (!canSave || !MERCHANT_ID) return;

    setSubmitting(true);
    try {
      let finalStoreImageUrl: string | null = initialStoreImage;
      let finalListImageUrl: string | null = initialListImage;

      if (storeImage === null) {
        finalStoreImageUrl = null;
      } else if (isLocalFileUri(storeImage)) {
        finalStoreImageUrl = await uploadToMinio(storeImage, "store-images");
      } else if (storeImage !== initialStoreImage) {
        finalStoreImageUrl = storeImage;
      }

      if (listImage === null) {
        finalListImageUrl = null;
      } else if (isLocalFileUri(listImage)) {
        finalListImageUrl = await uploadToMinio(listImage, "store-images");
      } else if (listImage !== initialListImage) {
        finalListImageUrl = listImage;
      }

      await updateStoreSettings(MERCHANT_ID, {
        name: storeName.trim(),
        storeImage: finalStoreImageUrl,
        listImage: finalListImageUrl,
      });

      Alert.alert("Success", "Store details updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error("Save store detail failed:", e);
      Alert.alert("Save failed", e?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView
        className="flex-1 bg-white items-center justify-center"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <ActivityIndicator />
        <Text className="mt-2 text-gray-500">Loading store details…</Text>
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
        title="Edit Store Details"
        onBack={() => router.back()}
      />

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Store Name */}
        <StoreNameField
          storeName={storeName}
          setStoreName={setStoreName}
        />

        {/* Store Image */}
        <StoreImagePickerSection
          title="Store image"
          description="This is the image for the top of your store menu."
          value={storeImage}
          onChange={setStoreImage}
        />

        {/* List Image */}
        <StoreImagePickerSection
          title="List image"
          description="This image will appear alongside other businesses when customers browse the restaurant list."
          value={listImage}
          onChange={setListImage}
        />

        {/* Save button */}
        <Pressable
          onPress={onSave}
          accessibilityLabel="save-store-detail"
          accessibilityState={{ disabled: !canSave }}
          disabled={!canSave}
          className={`mt-10 w-full rounded-2xl py-4 items-center justify-center ${
            canSave ? "bg-[#26BD68]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-[16px] font-semibold">
            {submitting ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
