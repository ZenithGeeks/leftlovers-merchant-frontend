import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FieldLabel from "@/components/add-item/FieldLabel";
import NumberStepper from "@/components/add-item/NumberStepper";
import SelectBox from "@/components/add-item/SelectBox";
import SelectModal, { Option } from "@/components/add-item/SelectModal";

import DatePickerField from "@/components/DatePickerField";
import ImagePickerField from "@/components/ImagePickerField";
import menuData from "@/mockupData/menuData.json";

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

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [expireAt, setExpireAt] = useState<Date | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Option | null>(null);
  const [group, setGroup] = useState<Option | null>(null);

  const [catOpen, setCatOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const priceNumber = Number(price.replace(/[^0-9.]/g, ""));
  const canSubmit = useMemo(
    () => name.trim().length > 0 && qty > 0 && !!category && priceNumber > 0,
    [name, qty, category, priceNumber]
  );

  const onSubmit = () => {
    if (!canSubmit) return;
    router.back();
    // Validate
    // if (!photoUri) { alert("Please upload a photo"); return; }
    // if (!expireAt) { alert("Please choose expire date"); return; }
    // send to API
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
        <Text className="ml-3 text-2xl font-bold text-[#11181C]">Add Item</Text>
      </View>

      <ScrollView
        className="flex-1 px-5 pb-6"
        keyboardShouldPersistTaps="handled"
      >
        <FieldLabel className="pb-2" label="Item name" required />
        <TextInput
          placeholder="Enter the name of this item"
          value={name}
          onChangeText={setName}
          accessibilityLabel="input-name"
          testID="input-name"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        <Text className="mb-4 mt-6 text-[24px] font-bold text-[#11181C]">
          Add Item
        </Text>

        <ImagePickerField value={photoUri} onChange={setPhotoUri} />

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
          value={price}
          onChangeText={setPrice}
          accessibilityLabel="input-price"
          testID="input-price"
          keyboardType="decimal-pad"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        <FieldLabel label="Group" className="mt-5 pb-2" />
        <SelectBox
          a11yLabel="open-category"
          placeholder="Select group"
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
          a11yPrefix="category"
        />

        <Pressable
          onPress={onSubmit}
          accessibilityLabel="submit"
          testID="submit"
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          className={`mt-7 w-full rounded-2xl py-4 items-center justify-center ${
            canSubmit ? "bg-[#26BD68]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-[16px] font-semibold">Done</Text>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
