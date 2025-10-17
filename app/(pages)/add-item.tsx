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

  // Form states
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
  const [loading, setLoading] = useState(false);

  const priceNumber = parseFloat(price.replace(/[^0-9.]/g, ""));
  const canSubmit = useMemo(
    () => name.trim().length > 0 && qty > 0 && !!category && priceNumber > 0,
    [name, qty, category, priceNumber]
  );

  // --- 🧠 Submit Handler (FormData upload)
  const onSubmit = async () => {
    if (!canSubmit) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("merchantId", "MERCHANT001"); // TODO: replace with logged-in merchant
      formData.append("name", name.trim());
      formData.append("description", desc.trim());
      formData.append("basePrice", String(priceNumber));
      formData.append("leftoverQty", String(qty));
      formData.append("status", "PUBLISHED");

      if (category?.value) formData.append("categoryId", category.value);
      if (group?.value) formData.append("groupId", group.value);
      if (expireAt) formData.append("expiresAt", expireAt.toISOString());

      if (photoUri) {
        const filename = photoUri.split("/").pop()!;
        const ext = filename.split(".").pop();
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";
        formData.append("photo", {
          uri: photoUri,
          name: filename,
          type: mimeType,
        } as any);
      }

      console.log("📦 Submitting form data...");
    //   // 🔗 Replace this with your actual API endpoint
    //   const res = await fetch("https://your-api.com/api/menu-item", {
    //     method: "POST",
    //     headers: { Accept: "application/json" },
    //     body: formData,
    //   });

    //   const data = await res.json();
    //   console.log("✅ Response:", data);

    //   if (res.ok) {
    //     Alert.alert("Success", "Item created successfully!");
    //     router.back();
    //   } else {
    //     Alert.alert("Error", data?.message ?? "Failed to create item.");
    //   }
    // } catch (err) {
    //   console.error("❌ Submit error:", err);
    //   Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Scrollable Form */}
      <ScrollView
        className="flex-1 px-5 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Item Name */}
        <FieldLabel className="pb-2" label="Item name" required />
        <TextInput
          placeholder="Enter the name of this item"
          value={name}
          onChangeText={setName}
          accessibilityLabel="input-name"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        <Text className="mb-4 mt-6 text-[24px] font-bold text-[#11181C]">
          Add Item
        </Text>

        {/* Upload Image */}
        <ImagePickerField value={photoUri} onChange={setPhotoUri} />

        {/* Expire Date */}
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
          className="w-full min-h-[120px] rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        {/* Quantity */}
        <FieldLabel label="Quantity" required className="mt-5 pb-2" />
        <NumberStepper value={qty} onChange={setQty} />

        {/* Category */}
        <FieldLabel label="Category" required className="mt-5 pb-2" />
        <SelectBox
          placeholder="Select a category"
          value={category?.label}
          onPress={() => setCatOpen(true)} a11yLabel={"category"}        />
        <SelectModal
          visible={catOpen}
          options={categories}
          onClose={() => setCatOpen(false)}
          onSelect={(opt) => {
            setCategory(opt);
            setCatOpen(false);
          } } a11yPrefix={"category"}        />

        {/* Price */}
        <FieldLabel label="Price" required className="mt-5 pb-2" />
        <TextInput
          placeholder="THB"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        {/* Group */}
        <FieldLabel label="Group" className="mt-5 pb-2" />
        <SelectBox
          placeholder="Select group"
          value={group?.label}
          onPress={() => setGroupOpen(true)} a11yLabel={"group"}        />
        <SelectModal
          visible={groupOpen}
          options={groups}
          onClose={() => setGroupOpen(false)}
          onSelect={(opt) => {
            setGroup(opt);
            setGroupOpen(false);
          } } a11yPrefix={"group"}        />

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
