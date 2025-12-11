// components/store/BusinessHoursPreview.tsx
import React from "react";
import { Text, View } from "react-native";
import Row from "./Row";
import { ClockIcon } from "react-native-heroicons/outline";

const DAY_LABELS: { key: string; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

type Slot = { open: string; close: string };

type Props = {
  weekly: any; // keep loose because backend shape is already `any`
  onPressEdit: () => void;
};

export default function BusinessHoursPreview({ weekly, onPressEdit }: Props) {
  return (
    <View className="w-full">
      <Row
        icon={<ClockIcon size={18} color="#22C55E" />}
        title="Business hours"
        onPress={onPressEdit}
      />

      <View className="mt-1 pl-12">
        {weekly ? (
          DAY_LABELS.map(({ key, label }) => {
            const slots = ((weekly?.[key] ?? []) as Slot[]) || [];
            const isClosed = !slots || slots.length === 0;

            const text = isClosed
              ? "Closed"
              : slots.map((s) => `${s.open}-${s.close}`).join(", ");

            return (
              <View key={key} className="flex-row py-0.5">
                <Text className="w-10 text-[13px] text-gray-500">{label}</Text>
                <Text className="ml-4 text-[13px] text-gray-500">{text}</Text>
              </View>
            );
          })
        ) : (
          <Text className="text-[14px] text-gray-500">Not configured yet.</Text>
        )}
      </View>
    </View>
  );
}
