// components/store/CuisineCertificationForm.tsx
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import FieldLabel from "@/components/add-item/FieldLabel";
import type { Category } from "@/services/category";

type Props = {
  categories: Category[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
  error?: string | null;
  bottomPadding: number;
};

export default function CuisineCertificationForm({
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  canSave,
  saving,
  onSave,
  error,
  bottomPadding,
}: Props) {
  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) ?? null;

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

      {/* Cuisine Type (category dropdown-style list) */}
      <FieldLabel label="Cuisine Type" className="pb-2 pt-4" required />
      {categories.length === 0 ? (
        <Text className="text-gray-500 mb-3">
          No categories configured. Please contact admin.
        </Text>
      ) : (
        <View className="mb-4">
          {/* Display-style selected box */}
          <Pressable
            className="w-full rounded-xl border border-gray-300 px-4 py-3 flex-row justify-between items-center"
            onPress={() => {
              // selection is done in the list below; this is just a display box
            }}
          >
            <Text className="text-[16px] text-[#11181C]">
              {selectedCategory
                ? selectedCategory.name
                : "Select cuisine category"}
            </Text>
          </Pressable>

          {/* Simple list of categories to choose from */}
          <View className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
            {categories.map((cat) => {
              const active = cat.id === selectedCategoryId;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 flex-row items-center justify-between ${
                    active ? "bg-emerald-50" : "bg-white"
                  }`}
                >
                  <Text className="text-[15px] text-[#11181C]">
                    {cat.name}
                  </Text>
                  {active && (
                    <Text className="text-emerald-600 text-[13px]">
                      Selected
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Certification – just show "Verified" (no upload) */}
      <FieldLabel label="Certification" className="pb-2 pt-6" />
      <View className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 flex-row items-center justify-between">
        <View>
          <Text className="text-[14px] text-emerald-700 font-semibold">
            Certification status
          </Text>
        </View>
        <View className="px-3 py-1 rounded-full bg-emerald-600">
          <Text className="text-[12px] text-white font-semibold">
            Verified
          </Text>
        </View>
      </View>

      {/* Save */}
      <Pressable
        onPress={onSave}
        disabled={!canSave}
        accessibilityLabel="save-cuisine-certification"
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
