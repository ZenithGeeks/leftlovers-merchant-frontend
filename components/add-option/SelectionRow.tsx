import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { MinusCircleIcon } from "react-native-heroicons/outline";

export type Selection = {
  id: string;
  name: string;
  priceDelta?: string;
};

type Props = {
  index: number;
  value: Selection;
  onChange: (patch: Partial<Selection>) => void;
  onRemove?: () => void;
  canRemove?: boolean;
};

export default function SelectionRow({
  index,
  value,
  onChange,
  onRemove,
  canRemove,
}: Props) {
  return (
    <View className="mb-3 rounded-2xl border border-gray-200 bg-white p-4">
      <Text className="mb-2 text-sm font-semibold text-gray-900">{`Selection ${index + 1}`}</Text>

      <TextInput
        placeholder="Enter selection name (e.g., 100%, Oat Milk)"
        value={value.name}
        accessibilityLabel={`selection-${index}-name`}
        testID={`selection-${index}-name`}
        className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-gray-900"
        onChangeText={(t) => onChange({ name: t })}
      />

      <View className="flex-row gap-3">
        <TextInput
          placeholder="Price delta (optional)"
          value={value.priceDelta ?? ""}
          keyboardType="decimal-pad"
          accessibilityLabel={`selection-${index}-price`}
          testID={`selection-${index}-price`}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-gray-900"
          onChangeText={(t) => onChange({ priceDelta: t })}
        />
        {canRemove ? (
          <Pressable
            accessibilityLabel={`remove-selection-${index}`}
            onPress={onRemove}
            className="h-[48px] w-[48px] items-center justify-center rounded-xl bg-red-50"
          >
            <MinusCircleIcon size={22} color="#DC2626" />
          </Pressable>
        ) : (
          <View className="h-[48px] w-[48px]" />
        )}
      </View>
    </View>
  );
}
