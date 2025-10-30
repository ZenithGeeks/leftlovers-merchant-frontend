// app/add-option.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddOptionForm, { OptionGroupPayload } from "@/components/add-option/AddOptionForm";
import { ThemedView } from "@/components/themed-view";
import { createMerchantOptionGroup } from "@/services/group";

export default function AddOptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ merchantId?: string; menuId?: string }>();

  // Fallbacks if not provided in route
  const merchantId = params.merchantId || "c4c9f4f8-2315-4b1e-8d55-6a8f85bb599f";
  const menuId = params.menuId || "ba872c78-7531-4901-b0cc-aba2d26a9662";

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: OptionGroupPayload) => {
    if (!merchantId || !menuId) {
      Alert.alert("Missing info", "merchantId or menuId is missing.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        menuId,
        name: data.name,
        minSelect: data.minSelect,
        maxSelect: data.maxSelect,
        options: data.options.map(o => ({
          name: o.name,
          priceDelta: o.priceDelta,
          active: o.active,
          sortOrder: o.sortOrder,
        })),
      };

      await createMerchantOptionGroup(merchantId, payload);

      Alert.alert("Success", "Option group created.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message ?? "Failed to create option group.");
    } finally {
      setSubmitting(false);
    }
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
        <Text className="ml-3 text-2xl font-bold text-[#11181C]">Add group</Text>
      </View>

      {/* Form */}
      <View className="flex-1 px-5">
        <AddOptionForm
          defaultMin={0}
          defaultMax={1}
          initialName=""
          initialSelections={[{ id: "s-1", name: "", priceDelta: "" }]}
          onSubmit={handleSubmit}
        />

        {/* Simple disabled overlay state */}
        {submitting ? (
          <View className="absolute inset-0 bg-black/10" />
        ) : null}
      </View>
    </ThemedView>
  );
}
