import OptionList, { OptionItem } from "@/components/Menu/Option-List";
import { deleteGroupOption, deleteOptionGroup } from "@/services/group";
import { updateOptionStatus } from "@/services/options";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Easing, Pressable, Text, View } from "react-native";
import { ChevronUpIcon, TrashIcon } from "react-native-heroicons/outline";

type Option = {
  id: string;
  optionGroupId?: string;
  name: string;
  active: boolean;
  priceDelta: number;
  sortOrder?: number;
};

type Props = {
  merchantId: string;
  groupId: string;
  title?: string;
  options: Option[];
  defaultExpanded?: boolean;
  onAfterChange?: () => void;
};

export default function OptionWrapper({
  merchantId,
  groupId,
  title = "Options",
  options,
  defaultExpanded = true,
  onAfterChange,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [deleting, setDeleting] = useState(false);
  const [deletingOptionId, setDeletingOptionId] = useState<string | null>(null);
  const [localOptions, setLocalOptions] = useState<Option[]>(options ?? []);

  useEffect(() => {
    setLocalOptions(options ?? []);
  }, [options]);

  const sortedOptions: OptionItem[] = useMemo(
    () =>
      (localOptions ?? [])
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((o) => ({
          id: o.id,
          name: o.name,
          priceDelta: o.priceDelta,
          active: !!o.active,
        })),
    [localOptions]
  );

  const rotation = useRef(new Animated.Value(defaultExpanded ? 0 : 1)).current;
  useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? 0 : 1,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [expanded, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const confirmDeleteGroup = () => {
    Alert.alert(
      "Delete group",
      `Are you sure you want to delete "${title}" and all of its options?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteOptionGroup(merchantId, groupId);
              onAfterChange?.();
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "Failed to delete group.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteOption = (optionId: string) => {
    Alert.alert("Delete option", "Are you sure you want to remove this option?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingOptionId(optionId);
            await deleteGroupOption(merchantId, groupId, optionId);
            onAfterChange?.();
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Failed to delete option.");
          } finally {
            setDeletingOptionId(null);
          }
        },
      },
    ]);
  };

  const onToggleAvailability = async (optionId: string, nextActive: boolean) => {
    const prev = localOptions;
    setLocalOptions((p) =>
      p.map((x) => (x.id === optionId ? { ...x, active: nextActive } : x))
    );

    try {
      await updateOptionStatus(optionId, nextActive);
      onAfterChange?.();
    } catch (e: any) {
      setLocalOptions(prev);
      Alert.alert("Error", e?.message ?? "Failed to update option status.");
    }
  };

  return (
    <View>
      <View className="flex-row items-center mb-2 px-0 py-4">
        <Text className="flex-1 text-2xl font-semibold text-gray-900">{title}</Text>

        <Pressable
          onPress={confirmDeleteGroup}
          className="mr-2 w-9 h-9 rounded-full bg-red-50 items-center justify-center"
          accessibilityLabel={`delete-group-${title}`}
          disabled={deleting}
        >
          <TrashIcon size={18} color={deleting ? "#FCA5A5" : "#EF4444"} />
        </Pressable>

        <Pressable
          onPress={() => setExpanded((p) => !p)}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-green-100 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={`Toggle ${title}`}
          accessibilityState={{ expanded }}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <ChevronUpIcon size={18} color="#22C55E" />
          </Animated.View>
        </Pressable>
      </View>

      {expanded && (
        <View className="bg-white rounded-2xl p-2 border border-gray-200">
          {sortedOptions.length === 0 ? (
            <View className="items-center py-4">
              <Text className="text-gray-500 text-base font-medium">No options available</Text>
            </View>
          ) : (
            <OptionList
              options={sortedOptions}
              onToggleAvailability={onToggleAvailability}
              onDelete={handleDeleteOption}
              deletingId={deletingOptionId}
            />
          )}
        </View>
      )}
    </View>
  );
}
