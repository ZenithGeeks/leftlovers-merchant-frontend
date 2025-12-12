import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddOptionForm, {
  OptionGroupPayload,
} from "@/components/add-option/AddOptionForm";
import { ThemedView } from "@/components/themed-view";
import { createMerchantOptionGroup } from "@/services/group";

type AddOptionParams = { merchantId?: string };

export default function AddOptionScreen() {
  const params = useLocalSearchParams<AddOptionParams>();
  const merchantId = params.merchantId ?? "";

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const handleSubmit = useCallback(
    async (data: OptionGroupPayload) => {
      if (!merchantId) return;
      if (submitLockRef.current) return;

      submitLockRef.current = true;
      setSubmitting(true);

      try {
        const payload = {
          name: data.name,
          merchantId,
          minSelect: data.minSelect,
          maxSelect: data.maxSelect,
          options: data.options.map((o) => ({
            name: o.name,
            priceDelta: Number(o.priceDelta || 0),
            active: o.active,
            sortOrder: o.sortOrder,
          })),
        };

        await createMerchantOptionGroup(merchantId, payload);

        Alert.alert("Success", "Option group created.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch (err: any) {
        Alert.alert("Error", err?.message ?? "Failed to create option group.");
        submitLockRef.current = false;
        setSubmitting(false);
      }
    },
    [merchantId, router]
  );

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >
      <View className="px-5 pb-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="back"
          className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
          disabled={submitting}
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="ml-3 text-2xl font-bold text-[#11181C]">
          Add group
        </Text>
      </View>

      <View className="flex-1 px-5">
        <AddOptionForm
          defaultMin={0}
          defaultMax={1}
          initialName=""
          initialSelections={[{ id: "s-1", name: "", priceDelta: "" }]}
          onSubmit={handleSubmit}
        />

        {submitting && (
          <View className="absolute inset-0 bg-black/10 items-center justify-center">
            <ActivityIndicator />
          </View>
        )}
      </View>
    </ThemedView>
  );
}
