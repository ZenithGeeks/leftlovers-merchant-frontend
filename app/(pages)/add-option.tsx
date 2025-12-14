import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddOptionForm, { OptionGroupPayload } from "@/components/add-option/AddOptionForm";
import { ThemedView } from "@/components/themed-view";
import { createMerchantOptionGroup } from "@/services/group";

type AddOptionParams = { merchantId?: string };

const normalizeName = (v: unknown) =>
  String(v ?? "")
    .trim()
    .replace(/\s+/g, " ");

const toNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function AddOptionScreen() {
  const params = useLocalSearchParams<AddOptionParams>();
  const merchantId = params.merchantId ?? "";

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const initialSelectionsRef = useRef([{ id: `s-${Date.now()}-${Math.random()}`, name: "", priceDelta: "" }]);

  const handleSubmit = useCallback(
    async (data: OptionGroupPayload) => {
      if (!merchantId) return;
      if (submitting) return;
      if (submitLockRef.current) return;

      submitLockRef.current = true;
      setSubmitting(true);

      try {
        const raw = (data.options ?? []).map((o, idx) => {
          const name = normalizeName(o.name);
          return {
            name,
            priceDelta: toNumber(o.priceDelta ?? 0),
            active: o.active ?? true,
            sortOrder: typeof o.sortOrder === "number" ? o.sortOrder : idx,
          };
        });

        const seen = new Set<string>();
        const deduped = raw
          .filter((o) => o.name.length > 0)
          .filter((o) => {
            const key = o.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((o, idx) => ({ ...o, sortOrder: idx }));

        const optionCount = deduped.length;
        const minSelect = Math.max(0, Math.min(toNumber(data.minSelect ?? 0), optionCount));
        const maxSelect = Math.max(minSelect, Math.min(toNumber(data.maxSelect ?? 1), optionCount));

        const payload = {
          name: normalizeName(data.name),
          merchantId,
          minSelect,
          maxSelect,
          options: deduped,
        };

        await createMerchantOptionGroup(merchantId, payload);
        Alert.alert("Success", "Option group created.", [
          {
            text: "OK",
            onPress: () => {
              setSubmitting(false);
              submitLockRef.current = false;
              router.back();
            },
          },
        ]);
      } catch (err: any) {
        Alert.alert("Error", err?.message ?? "Failed to create option group.");
        submitLockRef.current = false;
        setSubmitting(false);
      }
    },
    [merchantId, router, submitting]
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
        <Text className="ml-3 text-2xl font-bold text-[#11181C]">Add group</Text>
      </View>

      <View className="flex-1 px-5">
        <AddOptionForm
          defaultMin={0}
          defaultMax={1}
          initialName=""
          initialSelections={initialSelectionsRef.current}
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
