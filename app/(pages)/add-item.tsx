// app/add-item.tsx
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FieldLabel from "@/components/add-item/FieldLabel";
import NumberStepper from "@/components/add-item/NumberStepper";
import SelectBox from "@/components/add-item/SelectBox";
import SelectModal, { Option } from "@/components/add-item/SelectModal";
import DatePickerField from "@/components/DatePickerField";
import ImagePickerField from "@/components/ImagePickerField";

import menuData from "@/mockupData/menuData.json";
import { createMenuItem } from "@/services/menu";

const MERCHANT_ID = "c4c9f4f8-2315-4b1e-8d55-6a8f85bb599f"; // TODO: get from auth/session

const categories: Option[] = (menuData.categories ?? []).map((c: any) => ({
  label: c.name,
  value: c.id,
}));

const groups: Option[] = [
  { label: "Sweetness", value: "OG-001" },
  { label: "Ice Level", value: "OG-002" },
  { label: "Spiciness", value: "OG-004" },
  { label: "Add-ons", value: "OG-005" },
];

// Helper to safely parse number-like inputs
const asNumber = (s: string): number => {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ---- Form state ----
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState(1);

  const [price, setPrice] = useState("");           // basePrice (required)
  const [originalPrice, setOriginalPrice] = useState(""); // optional

  const [expireAt, setExpireAt] = useState<Date | null>(null);

  // Optional UI-only pickers (your backend body doesn’t use them)
  const [category, setCategory] = useState<Option | null>(null);
  const [group, setGroup] = useState<Option | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  // Images mapped to JSON fields
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [expireLabelUrl, setExpireLabelUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // ---- Derived values & validation ----
  const basePriceNum = asNumber(price);
  const originalPriceNum = asNumber(originalPrice);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && qty > 0 && basePriceNum > 0 && !loading,
    [name, qty, basePriceNum, loading]
  );

  // ---- Submit handler (JSON POST) ----
  const onSubmit = useCallback(async () => {
    if (!canSubmit) return;

    try {
      setLoading(true);

      // Your backend’s required/allowed body shape:
      // {
      //   "name": "", "description": "", "basePrice": 1, "originalPrice": 1,
      //   "leftoverQty": 1, "expiresAt": "", "status": "DRAFT",
      //   "photoUrl": "", "expireLabelUrl": ""
      // }

      const payload = {
        merchantId: MERCHANT_ID, // not in your curl body, but often useful; keep/remove as needed server-side
        name: name.trim(),
        description: desc.trim(),
        basePrice: basePriceNum,
        originalPrice: originalPrice ? originalPriceNum : undefined,
        leftoverQty: qty,
        expiresAt: expireAt ? expireAt.toISOString() : "",
        status: "DRAFT" as const, // as per your curl example
        photoUrl: photoUrl ?? "",
        expireLabelUrl: expireLabelUrl ?? "",
      };

      await createMenuItem(MERCHANT_ID, payload as any);

      Alert.alert("Success", "Item created successfully!");
      router.back();
    } catch (err: any) {
      console.error("Create menu item failed:", err);
      Alert.alert("Error", err?.message ?? "Failed to create item.");
    } finally {
      setLoading(false);
    }
  }, [
    canSubmit,
    name,
    desc,
    basePriceNum,
    originalPrice,
    originalPriceNum,
    qty,
    expireAt,
    photoUrl,
    expireLabelUrl,
    router,
  ]);

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
        <Text className="ml-3 text-2xl font-bold text-[#11181C]">Add Item</Text>
      </View>

      {/* Form */}
      <ScrollView
        className="flex-1 px-5 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Item name */}
        <FieldLabel className="pb-2" label="Item name" required />
        <TextInput
          placeholder="Enter the name of this item"
          value={name}
          onChangeText={setName}
          accessibilityLabel="input-name"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        {/* Images */}
        <Text className="mb-2 mt-6 text-xl font-bold text-[#11181C]">Menu Image</Text>
        <ImagePickerField value={photoUrl} onChange={setPhotoUrl} />

        <Text className="mb-2 mt-6 text-xl font-bold text-[#11181C]">Expiry Label (optional)</Text>
        <ImagePickerField value={expireLabelUrl} onChange={setExpireLabelUrl} />

        {/* Expire date */}
        <View className="h-5" />
        <DatePickerField value={expireAt} onChange={setExpireAt} />

        {/* Description */}
        <FieldLabel label="Description" className="mt-5 pb-2" />
        <TextInput
          placeholder="Enter a description"
          value={desc}
          onChangeText={setDesc}
          multiline
          textAlignVertical="top"
          accessibilityLabel="input-description"
          className="w-full min-h-[120px] rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        {/* Quantity */}
        <FieldLabel label="Quantity" required className="mt-5 pb-2" />
        <NumberStepper value={qty} onChange={setQty} testID={"Quantity"} />

        {/* Category (UI only; not required by backend body) */}
        <FieldLabel label="Category" className="mt-5 pb-2" />
        <SelectBox
          a11yLabel="category"
          placeholder="(optional) Select a category"
          value={category?.label}
          onPress={() => setCatOpen(true)}
        />
        <SelectModal
          visible={catOpen}
          options={categories}
          onClose={() => setCatOpen(false)}
          onSelect={(opt) => {
            setCategory(opt);
            setCatOpen(false);
          }}
          a11yPrefix="category"
        />

        {/* Prices */}
        <FieldLabel label="Price (base)" required className="mt-5 pb-2" />
        <TextInput
          placeholder="THB"
          value={price}
          onChangeText={setPrice}
          keyboardType={Platform.select({ ios: "decimal-pad", android: "numeric" })}
          accessibilityLabel="input-base-price"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        <FieldLabel label="Original Price (optional)" className="mt-5 pb-2" />
        <TextInput
          placeholder="THB"
          value={originalPrice}
          onChangeText={setOriginalPrice}
          keyboardType={Platform.select({ ios: "decimal-pad", android: "numeric" })}
          accessibilityLabel="input-original-price"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        {/* Group (UI only; not required by backend body) */}
        <FieldLabel label="Group" className="mt-5 pb-2" />
        <SelectBox
          a11yLabel="group"
          placeholder="(optional) Select group"
          value={group?.label}
          onPress={() => setGroupOpen(true)}
        />
        <SelectModal
          visible={groupOpen}
          options={groups}
          onClose={() => setGroupOpen(false)}
          onSelect={(opt) => {
            setGroup(opt);
            setGroupOpen(false);
          }}
          a11yPrefix="group"
        />

        {/* Submit */}
        <Pressable
          onPress={onSubmit}
          accessibilityLabel="submit"
          disabled={!canSubmit || loading}
          className={`mt-7 w-full rounded-2xl py-4 items-center justify-center ${
            canSubmit ? "bg-[#26BD68]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-[16px] font-semibold">
            {loading ? "Submitting..." : "Done"}
          </Text>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
