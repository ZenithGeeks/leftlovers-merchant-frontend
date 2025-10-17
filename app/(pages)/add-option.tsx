import AddOptionForm, { OptionGroupPayload } from "@/components/add-option/AddOptionForm";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddOptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const submitToApi = async (payload: OptionGroupPayload) => {
    await fetch("https://your-api.com/api/option-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    router.back();
  };

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 8 }}
    >
      <View className="px-5 pb-4 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="back"
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="ml-3 text-2xl font-bold text-[#11181C]">Add group</Text>
      </View>

      <ScrollView
        className="flex-1 px-5 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AddOptionForm onSubmit={submitToApi} />
      </ScrollView>
    </ThemedView>
  );
}
