import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Switch, Text, View } from "react-native";
import { TrashIcon } from "react-native-heroicons/outline";

export type OptionItem = {
  id: string;
  name: string;
  priceDelta: number;
  active: boolean;
};

type Props = {
  options: OptionItem[];
  onToggleAvailability: (id: string, nextActive: boolean) => Promise<void>;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
};

export default function OptionList({
  options,
  onToggleAvailability,
  onDelete,
  deletingId,
}: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sorted = useMemo(
    () => options.slice(),
    [options]
  );

  const toggle = async (id: string, nextActive: boolean) => {
    if (pendingId) return;
    setPendingId(id);
    try {
      await onToggleAvailability(id, nextActive);
    } finally {
      setPendingId(null);
    }
  };

  if (!sorted.length) {
    return (
      <View className="rounded-2xl p-4 bg-white shadow-sm items-center">
        <Text className="text-gray-500 text-base font-medium">No options available</Text>
      </View>
    );
  }

  return (
    <View className="rounded-xl p-4 bg-white">
      <View className="space-y-3">
        {sorted.map((item, idx) => {
          const isPending = pendingId === item.id;
          const isDeleting = deletingId === item.id;
          const disabled = isPending || isDeleting;

          return (
            <View
              key={item.id}
              className={`flex-row items-center justify-between pt-3 ${
                idx < sorted.length - 1 ? "border-b border-gray-100 pb-3" : ""
              }`}
            >
              <Pressable
                className="flex-1 pr-3"
                onPress={() => toggle(item.id, !item.active)}
                accessibilityLabel={`toggle-${item.name}`}
                disabled={disabled}
              >
                <Text className="text-[16px] font-medium text-gray-900">
                  {item.name}
                </Text>
                <Text className="text-[13px] text-gray-500">
                  {item.priceDelta.toFixed(2)} THB
                </Text>
                <Text className={`text-[11px] ${item.active ? "text-emerald-600" : "text-gray-400"}`}>
                  {item.active ? "Available" : "Unavailable"}
                </Text>
              </Pressable>

              <View className="flex-row items-center">
                {isPending ? (
                  <View className="mr-3">
                    <ActivityIndicator />
                  </View>
                ) : null}

                <Switch
                  accessibilityLabel={`${item.name}-switch`}
                  value={!!item.active}
                  onValueChange={(val) => toggle(item.id, val)}
                  disabled={disabled}
                  trackColor={{ false: "#E5E7EB", true: "#A7F3D0" }}
                  thumbColor={item.active ? "#10B981" : "#F4F4F5"}
                />

                {onDelete ? (
                  <Pressable
                    onPress={() => onDelete(item.id)}
                    className="ml-3 h-9 w-9 rounded-full bg-red-50 items-center justify-center"
                    accessibilityLabel={`delete-${item.name}`}
                    disabled={disabled}
                  >
                    <TrashIcon
                      size={18}
                      color={disabled ? "#FCA5A5" : "#EF4444"}
                    />
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
