import NumberStepper from "@/components/add-item/NumberStepper";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { PlusIcon } from "react-native-heroicons/outline";
import SelectionRow, { Selection } from "./SelectionRow";

export type OptionGroupPayload = {
  name: string;
  minSelect: number;
  maxSelect: number;
  options: { name: string; priceDelta: number; active: boolean; sortOrder: number }[];
};

type Props = {
  defaultMin?: number;
  defaultMax?: number;
  initialName?: string;
  initialSelections?: Selection[];
  onSubmit: (payload: OptionGroupPayload) => void;
};

export default function AddOptionForm({
  defaultMin = 0,
  defaultMax = 1,
  initialName = "",
  initialSelections = [{ id: "s-1", name: "", priceDelta: "" }],
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialName);
  const [minSelect, setMinSelect] = useState(defaultMin);
  const [maxSelect, setMaxSelect] = useState(defaultMax);
  const [rows, setRows] = useState<Selection[]>(initialSelections);

  // keep constraints: 0 <= min <= max, and max >= 1
  const handleMinChange = (v: number) => {
    const nextMin = Math.max(0, v);
    setMinSelect(nextMin);
    if (maxSelect < Math.max(1, nextMin)) setMaxSelect(Math.max(1, nextMin));
  };
  const handleMaxChange = (v: number) => {
    const nextMax = Math.max(1, v);
    setMaxSelect(nextMax);
    if (nextMax < minSelect) setMinSelect(nextMax);
  };

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    const filled = rows.filter((r) => r.name.trim().length > 0);
    return filled.length > 0 && maxSelect >= Math.max(1, minSelect);
  }, [name, rows, minSelect, maxSelect]);

  const addRow = () =>
    setRows((prev) => [...prev, { id: `s-${Date.now()}`, name: "", priceDelta: "" }]);

  const updateRow = (i: number, patch: Partial<Selection>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  const submit = () => {
    if (!canSubmit) return;
    const options = rows
      .map((r, idx) => ({
        name: r.name.trim(),
        priceDelta: r.priceDelta ? parseFloat(r.priceDelta) || 0 : 0,
        active: true,
        sortOrder: idx + 1,
      }))
      .filter((o) => !!o.name);

    onSubmit({ name: name.trim(), minSelect, maxSelect, options });
  };

  return (
    <ScrollView className="flex-1">
      <Text className="mb-2 text-[16px] font-semibold text-gray-900">
        Group name <Text className="text-red-500">*</Text>
      </Text>
      <TextInput
        testID="group-name"
        placeholder="Enter group name (e.g., Sweetness)"
        value={name}
        onChangeText={setName}
        accessibilityLabel="group-name"
        className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-gray-900"
      />

      <View className="mb-5 flex-row gap-4">
        <View className="flex-1">
          <Text className="mb-2 text-[16px] font-semibold text-gray-900">Min Select</Text>
          <NumberStepper
            value={minSelect}
            onChange={handleMinChange} testID={"Min"}            
          />
        </View>
        <View className="flex-1">
          <Text className="mb-2 text-[16px] font-semibold text-gray-900">Max Select</Text>
          <NumberStepper
            value={maxSelect}
            onChange={handleMaxChange} testID={"Max"}          />
        </View>
      </View>

      <Text className="mb-2 text-[16px] font-semibold text-gray-900">
        Group selections <Text className="text-red-500">*</Text>
      </Text>

      {rows.map((row, idx) => (
        <SelectionRow
          key={row.id}
          index={idx}
          value={row}
          onChange={(patch) => updateRow(idx, patch)}
          onRemove={() => removeRow(idx)}
          canRemove={rows.length > 1}

        />
      ))}

      <Pressable
        accessibilityLabel="add-selection"
        className="mb-6 mt-1 self-start rounded-xl bg-emerald-50 px-3 py-2"
        onPress={addRow}
      >
        <View className="flex-row items-center gap-2">
          <PlusIcon size={16} color="#059669" />
          <Text  className="text-[14px] font-semibold text-emerald-700">
            Add new selection
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityLabel="done"
        testID="done"
        disabled={!canSubmit}
        onPress={submit}
        className={`mt-auto w-full items-center justify-center rounded-2xl py-4 ${
          canSubmit ? "bg-[#26BD68]" : "bg-gray-300"
        }`}
      >
        <Text className="text-[16px] font-semibold text-white">Done</Text>
      </Pressable>
    </ScrollView>
  );
}
