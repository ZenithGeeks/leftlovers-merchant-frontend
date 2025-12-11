import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FieldLabel from "@/components/add-item/FieldLabel";
import NumberStepper from "@/components/add-item/NumberStepper";
import DatePickerField from "@/components/common/DatePickerField";
import SelectMultiModal, { MultiOption } from "@/components/common/SelectMultiModal";
import ImagePickerField, { type ImageValue } from "@/components/ImagePickerField";

import type { OptionGroupAPI } from "@/services/group";
import { fetchMerchantOptionGroups } from "@/services/group";
import { fetchMenuItem, updateMenuItem } from "@/services/menu";
import type { GroupTemplate, MenuItemAPI, UpdateMenuItemForm } from "@/types/types";

export default function EditItemScreen() {
  const { id, merchantId } = useLocalSearchParams<{ id?: string, merchantId?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState(0);
  const [basePrice, setBasePrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [expireLabelUrl, setExpireLabelUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"DRAFT" | "LIVE" | "SOLD_OUT" | "EXPIRED">("DRAFT");

  const toUri = (val: ImageValue): string | null => {
    if (!val) return null;
    if (typeof val === "string") return val;
    return val.uri ?? null;
  };
  const [expireAt, setExpireAt] = useState<Date | null>(null);

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [groupMultiOpen, setGroupMultiOpen] = useState(false);
  const [options, setOptions] = useState<OptionGroupAPI[]>([]);

  const basePriceNum = useMemo(() => {
    const n = parseFloat(basePrice.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }, [basePrice]);

  const origPriceNum = useMemo(() => {
    const n = parseFloat(originalPrice.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }, [originalPrice]);

  const groupTemplatesAll: GroupTemplate[] = useMemo(
    () =>
      options.map((g) => ({
        id: String(g.id ?? ""),
        name: String(g.name ?? ""),
        minSelect: Number.isFinite(g.minSelect) ? g.minSelect : 0,
        maxSelect: Number.isFinite(g.maxSelect) ? g.maxSelect : 1,
        options: (g.options ?? []).map((o) => ({
          name: String(o.name ?? ""),
          priceDelta: Number(o.priceDelta ?? 0),
          active: Boolean(o.active),
          sortOrder: Number.isFinite(o.sortOrder) ? o.sortOrder : 0,
        })),
      })),
    [options],
  );
   const groupOptionsAll: MultiOption<string>[] = useMemo(
    () => groupTemplatesAll.map((g) => ({ label: g.name, value: g.id })),
    [groupTemplatesAll],
  );

  const selectedGroups = useMemo(
    () => groupTemplatesAll.filter((g) => selectedGroupIds.includes(g.id)),
    [groupTemplatesAll, selectedGroupIds],
  );

  const canSubmit = useMemo(
    () =>
      name.trim().length > 0 &&
      qty >= 0 &&
      Number.isFinite(basePriceNum) &&
      basePriceNum > 0 &&
      !submitting,
    [name, qty, basePriceNum, submitting],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!id || !merchantId) return;

        const item = (await fetchMenuItem(
          merchantId,
          id,
        )) as MenuItemAPI;

        const groups = await fetchMerchantOptionGroups(merchantId);

        if (!mounted) return;

        setName(item.name ?? "");
        setDesc(item.description ?? "");
        setQty(item.leftoverQty ?? 0);
        setBasePrice(item.basePrice != null ? String(item.basePrice) : "");
        setOriginalPrice(
          item.originalPrice != null ? String(item.originalPrice) : "",
        );
        setPhotoUri(item.photoUrl ?? null);
        setExpireLabelUrl(item.expireLabelUrl ?? null);
        setExpireAt(item.expiresAt ? new Date(item.expiresAt) : null);
        setStatus((item as any).status ?? "DRAFT");
        setOptions(groups ?? []);

        const fromItemGroups = item.optionGroups?.map((g) => g.id) ?? [];
        setSelectedGroupIds(fromItemGroups);

      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, merchantId]);

  const onBack = useCallback(() => router.back(), [router]);

   const onSubmit = useCallback(async () => {
  if (!canSubmit || !id || !merchantId) return;

  setSubmitting(true);
  try {
    const apiBody = {
      name: name.trim(),
      basePrice: basePriceNum,
      description: desc.trim(),
      originalPrice: Number.isFinite(origPriceNum) ? origPriceNum : null,
      leftoverQty: qty,
      status,
      expiresAt: expireAt ? expireAt.toISOString() : null,
      groupTemplateIds: selectedGroupIds,
      ...(photoUri ? { photoUrl: photoUri } : {}),
      ...(expireLabelUrl ? { expireLabelUrl: expireLabelUrl } : {}),
    };
    await updateMenuItem(
      { id, ...apiBody } as unknown as UpdateMenuItemForm,
      merchantId,
    );

    router.back();
  } catch (e) {
    console.error("Update menu item failed:", e);
    setSubmitting(false);
  }
}, [canSubmit, id, merchantId, name, basePriceNum, desc, origPriceNum, qty, status, expireAt, selectedGroupIds, photoUri, expireLabelUrl, router]);

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center bg-white">
        <Text className="text-base text-gray-700">Loading…</Text>
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
          onPress={onBack}
          accessibilityLabel="back"
          className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="ml-3 text-2xl font-bold text-[#11181C]">Edit Item</Text>
      </View>

      <ScrollView className="flex-1 px-5 pb-6" keyboardShouldPersistTaps="handled">
        <FieldLabel className="pb-2 pt-2" label="Item name" required />
        <TextInput
          placeholder="Enter the name"
          value={name}
          onChangeText={setName}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        <Text className="mb-2 mt-6 text-xl font-bold text-[#11181C]">
          Menu Image
        </Text>
       <ImagePickerField
        value={photoUri}
        onChange={(val) => setPhotoUri(toUri(val))}
      />

        <Text className="mb-2 mt-6 text-xl font-bold text-[#11181C]">
          Expiry Date Label
        </Text>
        <ImagePickerField
          value={expireLabelUrl}
          onChange={(val) => setExpireLabelUrl(toUri(val))}
        />

        <View className="h-5" />
        <DatePickerField value={expireAt} onChange={setExpireAt} />

        <FieldLabel label="Description" className="mt-5 pb-2" />
        <TextInput
          placeholder="Enter a description"
          value={desc}
          onChangeText={setDesc}
          multiline
          textAlignVertical="top"
          className="w-full min-h-[120px] rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        <FieldLabel label="Quantity" required className="mt-5 pb-2" />
        <NumberStepper value={qty} onChange={setQty} testID={"quantity"} />

        <FieldLabel label="Price" required className="mt-5 pb-2" />
        <TextInput
          placeholder="THB"
          value={basePrice}
          onChangeText={setBasePrice}
          keyboardType={Platform.select({ ios: "decimal-pad", android: "numeric" })}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        <FieldLabel label="Original Price (optional)" className="mt-5 pb-2" />
        <TextInput
          placeholder="THB"
          value={originalPrice}
          onChangeText={setOriginalPrice}
          keyboardType={Platform.select({ ios: "decimal-pad", android: "numeric" })}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        <FieldLabel label="Option Groups" className="mt-5 pb-2" />
        <Pressable
          onPress={() => setGroupMultiOpen(true)}
          accessibilityLabel="open-option-groups"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 flex-row flex-wrap gap-2"
        >
          {selectedGroups.length === 0 ? (
            <Text className="text-gray-500">Select one or more groups</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {selectedGroups.map((g) => (
                <View key={g.id} className="px-3 py-1 rounded-full bg-green-100">
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
          accessibilityLabel="save"
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          className={`mt-7 w-full rounded-2xl py-4 items-center justify-center ${
            canSubmit ? "bg-[#26BD68]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-[16px] font-semibold">
            {submitting ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
