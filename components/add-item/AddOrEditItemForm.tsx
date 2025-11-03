import FieldLabel from "@/components/add-item/FieldLabel";
import NumberStepper from "@/components/add-item/NumberStepper";
import SelectBox from "@/components/add-item/SelectBox";
import SelectModal, { Option } from "@/components/add-item/SelectModal";
import DatePickerField from "@/components/common/DatePickerField";
import ImagePickerField from "@/components/ImagePickerField";
import { ThemedView } from "@/components/themed-view";

import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type MenuItemFormValues = {
  id?: string;
  merchantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  basePrice: number;
  originalPrice: number | null;
  leftoverQty: number;
  expiresAt: Date | null;
  status: "DRAFT" | "LIVE" | "SOLD_OUT" | "EXPIRED";
  photoUri: string | null;
  expirePhotoUri?: string | null;
};

type Props = {
  title?: string;
  categories: Option[];
  initialValues?: Partial<MenuItemFormValues>;
  isEditing?: boolean;
  submitting?: boolean;
  onSubmit: (values: MenuItemFormValues) => Promise<void> | void;
};

const DEFAULTS: MenuItemFormValues = {
  merchantId: "",
  categoryId: null,
  name: "",
  description: null,
  basePrice: 0,
  originalPrice: null,
  leftoverQty: 1,
  expiresAt: null,
  status: "DRAFT",
  photoUri: null,
  expirePhotoUri: null,
};

export default function AddOrEditItemForm({
  title = "Add Item",
  categories,
  initialValues,
  isEditing,
  submitting = false,
  onSubmit,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const merged = { ...DEFAULTS, ...initialValues };

  const [name, setName] = useState(merged.name);
  const [desc, setDesc] = useState(merged.description ?? "");
  const [qty, setQty] = useState(merged.leftoverQty || 1);
  const [basePrice, setBasePrice] = useState(
    merged.basePrice ? String(merged.basePrice) : ""
  );
  const [originalPrice, setOriginalPrice] = useState(
    merged.originalPrice ? String(merged.originalPrice) : ""
  );
  const [category, setCategory] = useState<Option | null>(
    merged.categoryId
      ? categories.find((c) => c.value === merged.categoryId) ?? null
      : null
  );
  const [photoUri, setPhotoUri] = useState<string | null>(merged.photoUri ?? null);
  const [expirePhotoUri, setExpirePhotoUri] = useState<string | null>(
    merged.expirePhotoUri ?? null
  );
  const [expireAt, setExpireAt] = useState<Date | null>(merged.expiresAt ?? null);
  const [catOpen, setCatOpen] = useState(false);
  useEffect(() => {
    if (!initialValues) return;
    setName(merged.name);
    setDesc(merged.description ?? "");
    setQty(merged.leftoverQty || 1);
    setBasePrice(merged.basePrice ? String(merged.basePrice) : "");
    setOriginalPrice(merged.originalPrice ? String(merged.originalPrice) : "");
    setCategory(
      merged.categoryId
        ? categories.find((c) => c.value === merged.categoryId) ?? null
        : null
    );
    setPhotoUri(merged.photoUri ?? null);
    setExpirePhotoUri(merged.expirePhotoUri ?? null);
    setExpireAt(merged.expiresAt ?? null);
  }, [categories, initialValues, merged.basePrice, merged.categoryId, merged.description, merged.expirePhotoUri, merged.expiresAt, merged.leftoverQty, merged.name, merged.originalPrice, merged.photoUri]);

  const basePriceNum = parseFloat(basePrice.replace(/[^0-9.]/g, ""));
  const originalPriceNum = parseFloat(originalPrice.replace(/[^0-9.]/g, ""));

  const canSubmit = useMemo(
    () =>
      name.trim().length > 0 &&
      qty > 0 &&
      !!category &&
      Number.isFinite(basePriceNum) &&
      basePriceNum > 0 &&
      !submitting,
    [name, qty, category, basePriceNum, submitting]
  );

  const submit = async () => {
    if (!canSubmit) return;
    const payload: MenuItemFormValues = {
      id: merged.id,
      merchantId: merged.merchantId,
      categoryId: category?.value ?? null,
      name: name.trim(),
      description: desc || null,
      basePrice: basePriceNum,
      originalPrice: Number.isFinite(originalPriceNum) ? originalPriceNum : null,
      leftoverQty: qty,
      expiresAt: expireAt ?? null,
      status: merged.status || "DRAFT",
      photoUri,
      expirePhotoUri,
    };
    await onSubmit(payload);
  };

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >
      <View className="px-5 pb-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="back"
          className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="ml-3 text-2xl font-bold text-[#11181C]">
          {isEditing ? "Edit Item" : title}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 pb-6" keyboardShouldPersistTaps="handled">
        <FieldLabel className="pb-2 pt-2" label="Item name" required />
        <TextInput
          placeholder="Enter the name of this item"
          value={name}
          onChangeText={setName}
          accessibilityLabel="input-name"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        <Text className="mb-2 mt-6 text-xl font-bold text-[#11181C]">Menu Image</Text>
        <ImagePickerField value={photoUri} onChange={setPhotoUri} />

        <Text className="mb-2 mt-6 text-xl font-bold text-[#11181C]">Expiry Date Label</Text>
        <ImagePickerField value={expirePhotoUri} onChange={setExpirePhotoUri} />

        <View className="h-5" />
        <DatePickerField value={expireAt} onChange={setExpireAt} />

        <FieldLabel label="Description" className="mt-5 pb-2" />
        <TextInput
          placeholder="Enter a description"
          value={desc}
          onChangeText={setDesc}
          multiline
          textAlignVertical="top"
          accessibilityLabel="input-description"
          className="w-full min-h-[120px] rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        <FieldLabel label="Quantity" required className="mt-5 pb-2" />
        <NumberStepper value={qty} onChange={setQty} />

        <FieldLabel label="Category" required className="mt-5 pb-2" />
        <SelectBox
          a11yLabel="open-category"
          placeholder="Select a category"
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

        <FieldLabel label="Price" required className="mt-5 pb-2" />
        <TextInput
          placeholder="THB"
          value={basePrice}
          onChangeText={setBasePrice}
          accessibilityLabel="input-base-price"
          keyboardType={Platform.select({ ios: "decimal-pad", android: "numeric" })}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        <FieldLabel label="Original Price (optional)" className="mt-5 pb-2" />
        <TextInput
          placeholder="THB"
          value={originalPrice}
          onChangeText={setOriginalPrice}
          accessibilityLabel="input-original-price"
          keyboardType={Platform.select({ ios: "decimal-pad", android: "numeric" })}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        <Pressable
          onPress={submit}
          accessibilityLabel="submit"
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          className={`mt-7 w-full rounded-2xl py-4 items-center justify-center ${
            canSubmit ? "bg-[#26BD68]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-[16px] font-semibold">
            {submitting ? (isEditing ? "Updating..." : "Saving...") : isEditing ? "Update" : "Done"}
          </Text>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
