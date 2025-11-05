import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import storeData from "@/mockupData/storeData.json";

export default function EditAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const initial = useMemo(
    () => ({
      label: storeData.address?.label ?? "",
      line1: storeData.address?.line1 ?? "",
      line2: storeData.address?.line2 ?? "",
      city: storeData.address?.city ?? "",
      province: storeData.address?.province ?? "",
      postalCode: storeData.address?.postalCode ?? "",
    }),
    []
  );

  const [label, setLabel] = useState(initial.label);
  const [line1, setLine1] = useState(initial.line1);
  const [line2, setLine2] = useState(initial.line2);
  const [city, setCity] = useState(initial.city);
  const [province, setProvince] = useState(initial.province);
  const [postalCode, setPostalCode] = useState(initial.postalCode);

  const canSave = line1.trim().length > 0;

  const onSave = () => {
    console.log("Saving address:", {
      label: label.trim() || undefined,
      line1: line1.trim(),
      line2: line2.trim() || undefined,
      city: city.trim() || undefined,
      province: province.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
    });
    router.back();
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
        <Text
          className="ml-3 text-2xl font-bold text-[#11181C]"
          style={{ fontFamily: Fonts.bold }}
        >
          Edit Address
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Label (optional) */}
        <View className="mt-4">
          <Text className="text-[16px] font-semibold text-[#11181C]">Label (optional)</Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="e.g., Main Store, Kitchen, HQ"
            placeholderTextColor="#9AA0A6"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
          />
        </View>

        {/* Line 1 (required) */}
        <View className="mt-5">
          <Text className="text-[16px] font-semibold text-[#11181C]">
            Address Line 1 <Text className="text-[#EF4444]">*</Text>
          </Text>
          <TextInput
            value={line1}
            onChangeText={setLine1}
            placeholder="Street, building, house no."
            placeholderTextColor="#9AA0A6"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
          />
        </View>

        {/* Line 2 (optional) */}
        <View className="mt-5">
          <Text className="text-[16px] font-semibold text-[#11181C]">Address Line 2 (optional)</Text>
          <TextInput
            value={line2}
            onChangeText={setLine2}
            placeholder="Apartment, floor, unit"
            placeholderTextColor="#9AA0A6"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
          />
        </View>

        {/* City & Province */}
        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <Text className="text-[16px] font-semibold text-[#11181C]">City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="e.g., Bangkok"
              placeholderTextColor="#9AA0A6"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[16px] font-semibold text-[#11181C]">Province</Text>
            <TextInput
              value={province}
              onChangeText={setProvince}
              placeholder="e.g., Bangkok"
              placeholderTextColor="#9AA0A6"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
            />
          </View>
        </View>

        {/* Postal code */}
        <View className="mt-5">
          <Text className="text-[16px] font-semibold text-[#11181C]">Postal Code</Text>
          <TextInput
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="number-pad"
            placeholder="e.g., 10140"
            placeholderTextColor="#9AA0A6"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
          />
        </View>

        {/* Save */}
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          accessibilityLabel="save-address"
          className={`mt-8 w-full rounded-2xl py-4 items-center justify-center ${
            canSave ? "bg-[#26BD68]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-[16px] font-semibold">Save</Text>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
