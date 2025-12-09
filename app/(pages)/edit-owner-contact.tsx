import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";
import { ThemedView } from "@/components/themed-view";
import FieldLabel from "@/components/add-item/FieldLabel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditOwnerContact() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(
    () => phone.trim().length > 0 && email.trim().length > 0 && !saving,
    [phone, email, saving]
  );

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      // TODO: API call
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView className="flex-1 bg-white" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 pb-2 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="text-2xl font-bold text-[#11181C]">Edit Owner’s Contact</Text>
        <Pressable onPress={() => router.back()}>
          <XMarkIcon size={22} color="#11181C" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5">
        <FieldLabel label="Owner’s Mobile Number" className="pb-2 pt-4" required />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px]"
        />

        <FieldLabel label="Owner’s Email" className="pb-2 pt-6" required />
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
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
