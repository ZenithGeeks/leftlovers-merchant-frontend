// components/store/AddressForm.tsx
import LocationPicker from "@/components/Authen/LocationPicker";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  error: string | null;
  line1: string;
  setLine1: (v: string) => void;
  line2: string;
  setLine2: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  province: string;
  setProvince: (v: string) => void;
  postalCode: string;
  setPostalCode: (v: string) => void;
  lat: string;
  lng: string;
  setLat: (v: string) => void;
  setLng: (v: string) => void;
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
  bottomPadding: number;
};

export default function AddressForm({
  error,
  line1,
  setLine1,
  line2,
  setLine2,
  city,
  setCity,
  province,
  setProvince,
  postalCode,
  setPostalCode,
  lat,
  lng,
  setLat,
  setLng,
  canSave,
  saving,
  onSave,
  bottomPadding,
}: Props) {
  return (
    <ScrollView
      className="flex-1 px-5"
      contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {error && (
        <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
          <Text className="text-red-600 text-[14px]">{error}</Text>
        </View>
      )}

      {/* 🔹 Location picker (lat,lng) */}
      <View className="mt-4">
        <LocationPicker
          lat={lat}
          lng={lng}
          onChange={(newLat, newLng) => {
            setLat(newLat);
            setLng(newLng);
          }}
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
        <Text className="text-[16px] font-semibold text-[#11181C]">
          Address Line 2 (optional)
        </Text>
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
          <Text className="text-[16px] font-semibold text-[#11181C]">
            City
          </Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="e.g., Bangkok"
            placeholderTextColor="#9AA0A6"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
          />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-semibold text-[#11181C]">
            Province
          </Text>
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
        <Text className="text-[16px] font-semibold text-[#11181C]">
          Postal Code
        </Text>
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
        accessibilityState={{ disabled: !canSave }}
        className={`mt-8 w-full rounded-2xl py-4 items-center justify-center ${
          canSave ? "bg-[#26BD68]" : "bg-gray-300"
        }`}
      >
        <Text className="text-white text-[16px] font-semibold">
          {saving ? "Saving..." : "Save"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
