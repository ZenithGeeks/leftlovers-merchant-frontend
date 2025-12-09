// app/(page)/edit-store-contact.tsx
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import FieldLabel from "@/components/add-item/FieldLabel";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";

export default function EditStoreContact() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [ownerPhone, setOwnerPhone] = useState("+66 121 231 2121");
  const [ownerEmail, setOwnerEmail] = useState("anya.forger@kmutt.com");
  const [storePhone, setStorePhone] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(
    () => ownerPhone.trim().length > 0 && ownerEmail.trim().length > 0 && storePhone.trim().length > 0 && !saving,
    [ownerPhone, ownerEmail, storePhone, saving]
  );

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {

      router.back();
    } finally {
      setSaving(false);
    }
  };

  const horizontalPadding = 20;

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}
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

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 0 })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Store contact number */}
          <FieldLabel className="pb-2 pt-6" label="Store contact number" required />
          <TextInput
            placeholder="+66 ___ ___ ____"
            value={storePhone}
            onChangeText={setStorePhone}
            keyboardType="phone-pad"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
          />
        </ScrollView>

        {/* Floating Save button */}
        <View className="absolute left-0 right-0" style={{ bottom: insets.bottom + 20 }}>
          <View className="px-5">
            <Pressable
              onPress={onSave}
              accessibilityLabel="save-contact"
              accessibilityState={{ disabled: !canSave }}
              disabled={!canSave}
              className={`w-full rounded-2xl py-4 items-center justify-center ${
                canSave ? "bg-[#26BD68]" : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-[16px] font-semibold">
                {saving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
