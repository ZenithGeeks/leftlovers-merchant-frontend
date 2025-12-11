// components/store/OwnerContactForm.tsx
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import FieldLabel from "@/components/add-item/FieldLabel";

type OwnerContactFormProps = {
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
  error?: string | null;
  bottomPadding: number;
};

export default function OwnerContactForm({
  phone,
  setPhone,
  email,
  setEmail,
  canSave,
  saving,
  onSave,
  error,
  bottomPadding,
}: OwnerContactFormProps) {
  return (
    <ScrollView
      className="flex-1 px-5"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: bottomPadding + 24 }}
    >
      {error && (
        <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
          <Text className="text-red-600 text-[14px]">{error}</Text>
        </View>
      )}

      <FieldLabel
        label="Owner’s Mobile Number"
        className="pb-2 pt-4"
        required
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Enter owner mobile number"
        placeholderTextColor="#9AA0A6"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
      />

      <FieldLabel label="Owner Email" className="pb-2 pt-6" required />
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Enter owner email"
        placeholderTextColor="#9AA0A6"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
      />

      <Pressable
        onPress={onSave}
        disabled={!canSave}
        accessibilityLabel="save-owner-contact"
        accessibilityState={{ disabled: !canSave }}
        className={`mt-10 w-full rounded-2xl py-4 items-center ${
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
