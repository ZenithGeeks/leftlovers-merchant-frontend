// components/Menu/Option-List.tsx
import React, { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { TrashIcon } from "react-native-heroicons/outline";

export type OptionItem = {
  id: string;
  name: string;
  priceDelta: number;
  active: boolean;
};

type Props = {
  title?: string;
  options: OptionItem[];
  maxSelect?: number;
  onToggle?: (id: string, value: boolean) => void;
  onDelete?: (id: string) => void;  // ⬅️ NEW
  deletingId?: string | null;       // ⬅️ Optional UX disable state
};

export default function OptionList({
  title,
  options,
  maxSelect = options.length,
  onToggle,
  onDelete,
  deletingId,
}: Props) {
  const [items, setItems] = useState<OptionItem[]>(
    () => options.map((o) => ({ ...o, active: !!o.active }))
  );

  const isSingleSelect = maxSelect === 1;

  const handleToggle = (id: string, value: boolean) => {
    setItems((prev) => {
      if (isSingleSelect) {
        const next = prev.map((i) =>
          i.id === id ? { ...i, active: value } : { ...i, active: false }
        );
        onToggle?.(id, value);
        return next;
      }

      const next = prev.map((i) => (i.id === id ? { ...i, active: value } : i));
      const count = next.reduce((acc, itm) => acc + (itm.active ? 1 : 0), 0);
      if (count > maxSelect) return prev;

      onToggle?.(id, value);
      return next;
    });
  };

  if (!items.length) {
    return (
      <View className="rounded-2xl p-4 bg-white shadow-sm items-center">
        <Text className="text-gray-500 text-base font-medium">No options available</Text>
      </View>
    );
  }

  return (
    <View className="rounded-xl p-4 bg-white">
      <View className="space-y-3">
        {items.map((item, idx) => (
          <View
            key={item.id}
            className={`flex-row items-center justify-between ${
              idx < items.length - 1 ? "border-b border-gray-100 pb-3" : ""
            }`}
          >
            {/* Left: name + price */}
            <Pressable
              className="flex-1 pr-3"
              onPress={() => handleToggle(item.id, !item.active)}
              accessibilityLabel={`toggle-${item.name}`}
            >
              <Text className="text-[16px] font-medium text-gray-900">{item.name}</Text>
              <Text className="text-[13px] text-gray-500">
                {item.priceDelta.toFixed(2)} THB
              </Text>
            </Pressable>

            {/* Middle: toggle */}
            <Switch
              accessibilityLabel={`${item.name}-switch`}
              value={!!item.active}
              onValueChange={(val) => handleToggle(item.id, val)}
              trackColor={{ false: "#E5E7EB", true: "#A7F3D0" }}
              thumbColor={item.active ? "#10B981" : "#F4F4F5"}
            />

            {/* Right: delete */}
            {onDelete && (
              <Pressable
                onPress={() => onDelete(item.id)}
                className="ml-3 h-9 w-9 rounded-full bg-red-50 items-center justify-center"
                accessibilityLabel={`delete-${item.name}`}
                disabled={deletingId === item.id}
              >
                <TrashIcon size={18} color={deletingId === item.id ? "#FCA5A5" : "#EF4444"} />
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
