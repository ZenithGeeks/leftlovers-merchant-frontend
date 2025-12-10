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
import FieldLabel from "@/components/add-item/FieldLabel";
import ImagePickerField from "@/components/ImagePickerField";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";

import { DEV_MERCHANT_ID } from "@/utils/env";
import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/store";

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
        // DO NOT set Content-Type here (RN will set proper multipart boundary)
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

/** -----------------------
 * Screen
 * ------------------------ */

export default function EditStoreDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [storeName, setStoreName] = useState("");
  const [storeImage, setStoreImage] = useState<string | null>(null);
  const [listImage, setListImage] = useState<string | null>(null);

  // keep initial values so we know what changed
  const [initialName, setInitialName] = useState("");
  const [initialStoreImage, setInitialStoreImage] = useState<string | null>(null);
  const [initialListImage, setInitialListImage] = useState<string | null>(null);

  // 1) Load settings via services/store (uses EXPO_PUBLIC_API_BASE, which works)
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

      // ===== Store image =====
      if (storeImage === null) {
        // user removed image
        finalStoreImageUrl = null;
      } else if (isLocalFileUri(storeImage)) {
        // new local file picked → upload to MinIO
        finalStoreImageUrl = await uploadToMinio(storeImage, "store-images");
      } else if (storeImage !== initialStoreImage) {
        // different remote URL (rare but possible)
        finalStoreImageUrl = storeImage;
      }

      // ===== List image =====
      if (listImage === null) {
        finalListImageUrl = null;
      } else if (isLocalFileUri(listImage)) {
        finalListImageUrl = await uploadToMinio(listImage, "store-images");
      } else if (listImage !== initialListImage) {
        finalListImageUrl = listImage;
      }

      // 2) Use updateStoreSettings (same /merchant/:id/editstore backend)
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
      <View className="px-5 pb-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="back"
          className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="text-2xl font-bold text-[#11181C]">Edit Store Details</Text>
        <Pressable onPress={() => router.back()} accessibilityLabel="close">
          <XMarkIcon size={22} color="#11181C" />
        </Pressable>
      </View>

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
        <FieldLabel className="pb-2 pt-4" label="Store Name" required />
        <TextInput
          placeholder="Your store name"
          value={storeName}
          onChangeText={setStoreName}
          placeholderTextColor="#9AA0A6"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        {/* Store Image */}
        <View className="mt-8">
          <Text className="text-[18px] font-bold text-[#11181C] mb-2">Store image</Text>
          <Text className="text-[14px] text-[#6B7280] mb-3">
            This is the image for the top of your store menu.
          </Text>
          <ImagePickerField
            value={storeImage ?? undefined}
            onChange={(val: any) => {
              if (!val) {
                setStoreImage(null);
                return;
              }
              if (typeof val === "string") {
                setStoreImage(val);
              } else if (typeof val === "object" && val.uri) {
                setStoreImage(val.uri);
              } else {
                setStoreImage(null);
              }
            }}
          />
        </View>

        {/* List Image */}
        <View className="mt-8">
          <Text className="text-[18px] font-bold text-[#11181C] mb-2">List image</Text>
          <Text className="text-[14px] text-[#6B7280] mb-3">
            This image will appear alongside other businesses when customers browse
            the restaurant list.
          </Text>
          <ImagePickerField
            value={listImage ?? undefined}
            onChange={(val: any) => {
              if (!val) {
                setListImage(null);
                return;
              }
              if (typeof val === "string") {
                setListImage(val);
              } else if (typeof val === "object" && val.uri) {
                setListImage(val.uri);
              } else {
                setListImage(null);
              }
            }}
          />
        </View>

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
