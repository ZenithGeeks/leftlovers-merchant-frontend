// app/(page)/edit-cuisine-certification.tsx
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import FieldLabel from "@/components/add-item/FieldLabel";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";

export default function EditCuisineCertification() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [cuisine, setCuisine] = useState("Japanese");
  const [certification, setCertification] = useState("Halal");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(
    () => cuisine.trim().length > 0 && !saving,
    [cuisine, saving]
  );

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      // TODO: save API
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView className="flex-1 bg-white" style={{ paddingTop: insets.top + 8 }}>
      {/* Header */}
      <View className="px-5 pb-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="text-2xl font-bold text-[#11181C]">
          Edit Cuisine & Certification
        </Text>
        <Pressable onPress={() => router.back()}>
          <XMarkIcon size={22} color="#11181C" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <FieldLabel label="Cuisine Type" className="pb-2 pt-4" required />
        <TextInput
          placeholder="e.g. Thai, Japanese, Bakery"
          value={cuisine}
          onChangeText={setCuisine}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        <FieldLabel label="Certification" className="pb-2 pt-6" />
        <TextInput
          placeholder="e.g. Halal, Clean Food Good Taste"
          value={certification}
          onChangeText={setCertification}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        <Pressable
          onPress={onSave}
          disabled={!canSave}
          className={`mt-10 w-full rounded-2xl py-4 items-center ${
            canSave ? "bg-[#26BD68]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-[16px] font-semibold">
            {saving ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
