import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import FieldLabel from "@/components/add-item/FieldLabel";
import ImagePickerField from "@/components/ImagePickerField";
import UploadBox from "@/components/add-item/UploadBox";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";

export default function EditStoreDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [storeName, setStoreName] = useState("ANYA Restaurant - Bangmod");
  const [storeImage, setStoreImage] = useState<string | null>(null);
  const [listImage, setListImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSave = useMemo(() => storeName.trim().length > 0 && !submitting, [storeName, submitting]);

  const onSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    try {
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  const horizontalPadding = 20;

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >

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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
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
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
        />

        {/* Store Image */}
        <Text className="mb-2 mt-8 text-xl font-bold text-[#11181C]">Store Image</Text>
        {storeImage ? (
          <ImagePickerField value={storeImage} onChange={setStoreImage} />
        ) : (
          <UploadBox onPress={() => setStoreImage("pick://open")} />
        )}

        {/* List Image */}
        <Text className="mb-2 mt-8 text-xl font-bold text-[#11181C]">List Image</Text>
        {listImage ? (
          <ImagePickerField value={listImage} onChange={setListImage} />
        ) : (
          <UploadBox onPress={() => setListImage("pick://open")} />
        )}

        {/* Save */}
        <Pressable
          onPress={onSave}
          accessibilityLabel="save-store"
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
