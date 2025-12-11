// components/store/StoreNameField.tsx
import React from "react";
import { TextInput } from "react-native";
import FieldLabel from "@/components/add-item/FieldLabel";

type StoreNameFieldProps = {
  storeName: string;
  setStoreName: (v: string) => void;
};

export default function StoreNameField({
  storeName,
  setStoreName,
}: StoreNameFieldProps) {
  return (
    <>
      <FieldLabel className="pb-2 pt-4" label="Store Name" required />
      <TextInput
        placeholder="Your store name"
        value={storeName}
        onChangeText={setStoreName}
        placeholderTextColor="#9AA0A6"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#11181C]"
      />
    </>
  );
}
