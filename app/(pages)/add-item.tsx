import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FieldLabel from "@/components/add-item/FieldLabel";
import NumberStepper from "@/components/add-item/NumberStepper";
import DatePickerField from "@/components/common/DatePickerField";
import ImagePickerField from "@/components/ImagePickerField";

import SelectMultiModal, {
  MultiOption,
} from "@/components/common/SelectMultiModal";

import { fetchMerchantOptionGroups, OptionGroupAPI } from "@/services/group";
import { createMenuItem } from "@/services/menu";
import { GroupTemplate } from "@/types/types";

const EXPO_PUBLIC_MERCHANT_ID = process.env.EXPO_PUBLIC_MERCHANT_ID!;

const asNumber = (s: string): number => {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [expireAt, setExpireAt] = useState<Date | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [expireLabelUrl, setExpireLabelUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionGroups, setOptionGroups] = useState<OptionGroupAPI[]>([]);
  const [groupMultiOpen, setGroupMultiOpen] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const basePriceNum = asNumber(price);
  const originalPriceNum = asNumber(originalPrice);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && qty > 0 && basePriceNum > 0 && !submitting,
    [name, qty, basePriceNum, submitting]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const groups = await fetchMerchantOptionGroups(EXPO_PUBLIC_MERCHANT_ID);
        if (!mounted) return;
        setOptionGroups(groups ?? []);
      } catch {
        setOptionGroups([]);
      } finally {
        if (mounted) setOptionsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const groupTemplatesAll: GroupTemplate[] = useMemo(
    () =>
      (optionGroups ?? []).map((g) => ({
        id: String(g.id ?? ""),
        name: String(g.name ?? ""),
        merchantId: String(g.merchantId),
        minSelect: Number.isFinite(g?.minSelect) ? g.minSelect : 0,
        maxSelect: Number.isFinite(g?.maxSelect) ? g.maxSelect : 1,
        options: (g.options ?? []).map((o) => ({
          name: String(o.name ?? ""),
          priceDelta: Number(o.priceDelta ?? 0),
          active: !!o.active,
          sortOrder: Number.isFinite(o?.sortOrder) ? o.sortOrder : 0,
        })),
      })),
    [optionGroups]
  );

  const groupOptionsAll: MultiOption<string>[] = useMemo(
    () =>
      groupTemplatesAll.map((g) => ({
        label: g.name,
        value: g.id,
      })),
    [groupTemplatesAll]
  );

  const selectedGroups: GroupTemplate[] = useMemo(
    () => groupTemplatesAll.filter((g) => selectedGroupIds.includes(g.id)),
    [groupTemplatesAll, selectedGroupIds]
  );

  const onSubmit = useCallback(async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        description: desc.trim(),
        basePrice: basePriceNum,
        originalPrice: originalPrice ? originalPriceNum : undefined,
        leftoverQty: qty,
        expiresAt: expireAt ? expireAt.toISOString() : "",
        status: "DRAFT" as const,
        photoUrl: photoUrl ?? "",
        expireLabelUrl: expireLabelUrl ?? "",
        groupTemplates:
          selectedGroups.length > 0
            ? selectedGroups.map((g) => ({
                name: g.name,
                merchantId: EXPO_PUBLIC_MERCHANT_ID,
                minSelect: g.minSelect ?? 0,
                maxSelect: g.maxSelect ?? 1,
                options: (g.options ?? []).map((o) => ({
                  name: o.name,
                  priceDelta: o.priceDelta,
                  active: o.active ?? true,
                })),
              }))
            : undefined,
      };

      await createMenuItem(EXPO_PUBLIC_MERCHANT_ID, payload as any);

      Alert.alert("Success", "Item created successfully!");
      router.back();
    } catch (err: any) {
      console.error("Create menu item failed:", err);
      Alert.alert("Error", err?.message ?? "Failed to create item.");
    } finally {
      setSubmitting(false);
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
    selectedGroups,
    router,
  ]);

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
        <Text className="ml-3 text-2xl font-bold text-[#11181C]">Add Item</Text>
      </View>

      <ScrollView
        className="flex-1 px-5 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FieldLabel className="pb-2" label="Item name" required />
        <TextInput
          placeholder="Enter the name of this item"
          value={name}
          onChangeText={setName}
          accessibilityLabel="input-name"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        <Text className="mb-2 mt-6 text-xl font-bold text-[#11181C]">
          Menu Image
        </Text>
        <ImagePickerField value={photoUrl} onChange={setPhotoUrl} />
        <Text className="mb-2 mt-6 text-xl font-bold text-[#11181C]">
          Expiry Label (optional)
        </Text>
        <ImagePickerField value={expireLabelUrl} onChange={setExpireLabelUrl} />
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
          className="w-full min-h-[120px] rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />
        <FieldLabel label="Quantity" required className="mt-5 pb-2" />
        <NumberStepper value={qty} onChange={setQty} testID="quantity" />
        <FieldLabel label="Price (base)" required className="mt-5 pb-2" />
        <TextInput
          placeholder="THB"
          value={price}
          onChangeText={setPrice}
          keyboardType={Platform.select({
            ios: "decimal-pad",
            android: "numeric",
          })}
          accessibilityLabel="input-base-price"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />
        <FieldLabel label="Original Price (optional)" className="mt-5 pb-2" />
        <TextInput
          placeholder="THB"
          value={originalPrice}
          onChangeText={setOriginalPrice}
          keyboardType={Platform.select({
            ios: "decimal-pad",
            android: "numeric",
          })}
          accessibilityLabel="input-original-price"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />
        <FieldLabel label="Option Groups" className="mt-5 pb-2" />
        <Pressable
          onPress={() => setGroupMultiOpen(true)}
          accessibilityLabel="open-option-groups"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 flex-row flex-wrap gap-2"
        >
          {optionsLoading ? (
            <Text className="text-gray-500">Loading groups…</Text>
          ) : selectedGroups.length === 0 ? (
            <Text className="text-gray-500">Select one or more groups</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {selectedGroups.map((g) => (
                <View
                  key={g.id}
                  className="px-3 py-1 rounded-full bg-green-100"
                >
                  <Text className="text-green-700 text-[13px]">{g.name}</Text>
                </View>
              ))}
            </View>
          )}
        </Pressable>

        <SelectMultiModal
          visible={groupMultiOpen}
          options={groupOptionsAll}
          selected={selectedGroupIds}
          onClose={() => setGroupMultiOpen(false)}
          onApply={(vals) => {
            setSelectedGroupIds(vals);
            setGroupMultiOpen(false);
          }}
        />
        <Pressable
          onPress={onSubmit}
          accessibilityLabel="submit"
          disabled={!canSubmit}
          className={`mt-7 w-full rounded-2xl py-4 items-center justify-center ${
            canSubmit ? "bg-[#26BD68]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-[16px] font-semibold">
            {submitting ? "Submitting..." : "Done"}
          </Text>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
