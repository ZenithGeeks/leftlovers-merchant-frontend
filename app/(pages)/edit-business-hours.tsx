// app/(page)/edit-business-hours.tsx
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";
import { ThemedView } from "@/components/themed-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FieldLabel from "@/components/add-item/FieldLabel";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function EditBusinessHours() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [hours, setHours] = useState(
    DAYS.map((d) => ({ day: d, open: "15:00", close: "19:00", closed: d === "Wednesday" }))
  );
  const [saving, setSaving] = useState(false);

  const toggleClosed = (index: number) => {
    const next = [...hours];
    next[index].closed = !next[index].closed;
    setHours(next);
  };

  const onSave = async () => {
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
      {/* Header */}
      <View className="px-5 pb-2 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="text-2xl font-bold text-[#11181C]">Edit Business Hours</Text>
        <Pressable onPress={() => router.back()}>
          <XMarkIcon size={22} color="#11181C" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5">
        {hours.map((item, i) => (
          <View key={i} className="flex-row items-center justify-between py-3">
            <Text className="text-[16px] font-semibold text-[#11181C] w-28">{item.day}</Text>
            {item.closed ? (
              <Pressable onPress={() => toggleClosed(i)}>
                <Text className="text-gray-500 italic">Closed</Text>
              </Pressable>
            ) : (
              <View className="flex-row gap-2">
                <TextInput
                  value={item.open}
                  onChangeText={(t) => {
                    const next = [...hours]; next[i].open = t; setHours(next);
                  }}
                  className="border border-gray-300 rounded-xl px-3 py-2 w-[70px] text-center"
                />
                <Text className="text-[#11181C]">–</Text>
                <TextInput
                  value={item.close}
                  onChangeText={(t) => {
                    const next = [...hours]; next[i].close = t; setHours(next);
                  }}
                  className="border border-gray-300 rounded-xl px-3 py-2 w-[70px] text-center"
                />
              </View>
            )}
            <Pressable onPress={() => toggleClosed(i)}>
              <Text className="text-sm text-[#26BD68] font-semibold">
                {item.closed ? "Open" : "Close"}
              </Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={onSave}
          className={`mt-8 w-full rounded-2xl py-4 items-center justify-center ${
            saving ? "bg-gray-300" : "bg-[#26BD68]"
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
