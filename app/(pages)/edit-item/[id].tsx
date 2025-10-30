import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FieldLabel from "@/components/add-item/FieldLabel";
import NumberStepper from "@/components/add-item/NumberStepper";
import SelectBox from "@/components/add-item/SelectBox";
import SelectModal, { Option } from "@/components/add-item/SelectModal";
import SelectMultiModal, { MultiOption } from "@/components/common/SelectMultiModal";

import DatePickerField from "@/components/DatePickerField";
import ImagePickerField from "@/components/ImagePickerField";

import menuData from "@/mockupData/menuData.json";
import optionData from "@/mockupData/optionGroup.json";
import { fetchMenuItem, updateMenuItem } from "@/services/menu";
import type { GroupTemplate, UpdateMenuItemForm } from "@/types/types";

const categoriesAll: Option[] = (menuData.categories ?? []).map((c: any) => ({
  label: String(c.name ?? ""),
  value: String(c.id ?? ""),
}));

const groupTemplatesAll: GroupTemplate[] = (optionData.optionGroups ?? []).map((g: any) => ({
  id: String(g.id ?? ""),
  name: String(g.name ?? ""),
  minSelect: Number.isFinite(g?.minSelect) ? g.minSelect : 0,
  maxSelect: Number.isFinite(g?.maxSelect) ? g.maxSelect : 1,
  options: (g.options ?? []).map((o: any) => ({
    name: String(o.name ?? ""),
    priceDelta: Number(o.priceDelta ?? 0),
    active: !!o.active,
    sortOrder: Number.isFinite(o?.sortOrder) ? o.sortOrder : 0,
  })),
}));

const groupOptionsAll: MultiOption<string>[] = groupTemplatesAll.map((g) => ({
  label: g.name,
  value: g.id,
}));

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState(0);
  const [basePrice, setBasePrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState<Option | null>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [expirePhotoUri, setExpirePhotoUri] = useState<string | null>(null);
  const [expireAt, setExpireAt] = useState<Date | null>(null);

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // modals
  const [catOpen, setCatOpen] = useState(false);
  const [groupMultiOpen, setGroupMultiOpen] = useState(false);

  // derived
  const basePriceNum = useMemo(() => parseFloat(basePrice.replace(/[^0-9.]/g, "")), [basePrice]);
  const origPriceNum = useMemo(
    () => parseFloat(originalPrice.replace(/[^0-9.]/g, "")),
    [originalPrice]
  );

  const selectedGroups = useMemo(
    () => groupTemplatesAll.filter((g) => selectedGroupIds.includes(g.id)),
    [selectedGroupIds]
  );

  const canSubmit = useMemo(
    () => name.trim().length > 0 && qty >= 0 && Number.isFinite(basePriceNum) && basePriceNum > 0 && !submitting,
    [name, qty, basePriceNum, submitting]
  );

  // load current item
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const item = await fetchMenuItem(id); // {id,name,description,basePrice,originalPrice,leftoverQty,expiresAt,photoUrl,expirePhotoUrl,categoryId,groupTemplates?:GroupTemplate[]}
        if (!mounted) return;

        setName(item.name ?? "");
        setDesc(item.description ?? "");
        setQty(item.leftoverQty ?? 0);
        setBasePrice(String(item.basePrice ?? ""));
        setOriginalPrice(item.originalPrice != null ? String(item.originalPrice) : "");
        setPhotoUri(item.photoUrl ?? null);
        setExpirePhotoUri(item.expirePhotoUrl ?? null);
        setExpireAt(item.expiresAt ? new Date(item.expiresAt) : null);

        const catOpt = categoriesAll.find((c) => c.value === item.categoryId) ?? null;
        setCategory(catOpt);

        const fromItemGroups = (item.groupTemplates ?? []).map((g: GroupTemplate) => g.id);
        setSelectedGroupIds(fromItemGroups);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onBack = useCallback(() => router.back(), [router]);

  const onSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload: UpdateMenuItemForm = {
        id,
        name: name.trim(),
        description: desc || null,
        basePrice: basePriceNum,
        originalPrice: Number.isFinite(origPriceNum) ? origPriceNum : null,
        leftoverQty: qty,
        expiresAt: expireAt ?? null,
        photoUri,
        expirePhotoUri,
        categoryId: category?.value ?? null,
        groupTemplates: selectedGroups,
      };
      await updateMenuItem(payload);
      router.back();
    } catch (e) {
      console.error("Update menu item failed:", e);
      setSubmitting(false);
    }
  }, [
    canSubmit,
    id,
    name,
    desc,
    basePriceNum,
    origPriceNum,
    qty,
    expireAt,
    photoUri,
    expirePhotoUri,
    category,
    selectedGroups,
    router,
  ]);

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
          options={categoriesAll}
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
