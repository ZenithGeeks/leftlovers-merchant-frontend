import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import FieldLabel from "@/components/add-item/FieldLabel";
import ImagePickerField from "@/components/ImagePickerField";
import UploadBox from "@/components/add-item/UploadBox";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";

export default function EditStoreDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [storeName, setStoreName] = useState("CPE SHOP - Pracha Uthit");
  const [storeImage, setStoreImage] = useState<string | null>(null);
  const [listImage, setListImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSave = useMemo(() => storeName.trim().length > 0 && !submitting, [storeName, submitting]);

  const onSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    try {
      // TODO: Save logic (API or Supabase upload)
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

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

        {/* Store Image (Column layout) */}
        <View className="mt-8">
          <Text className="text-[18px] font-bold text-[#11181C] mb-2">Store image</Text>
          <Text className="text-[14px] text-[#6B7280] mb-3">
            This is the image for the top of your store menu.
          </Text>
          {storeImage ? (
            <ImagePickerField value={storeImage} onChange={setStoreImage} />
          ) : (
            <UploadBox onPress={() => setStoreImage("pick://open-store-image")} />
          )}
        </View>

        {/* List Image (Column layout) */}
        <View className="mt-8">
          <Text className="text-[18px] font-bold text-[#11181C] mb-2">List image</Text>
          <Text className="text-[14px] text-[#6B7280] mb-3">
            This image will appear alongside other businesses when customers browse
            the restaurant list.
          </Text>
          {listImage ? (
            <ImagePickerField value={listImage} onChange={setListImage} />
          ) : (
            <UploadBox onPress={() => setListImage("pick://open-list-image")} />
          )}
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
