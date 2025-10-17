import OptionList, { OptionItem } from "@/components/Menu/Option-List";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { ChevronUpIcon } from "react-native-heroicons/solid";

type Option = {
  id: string;
  optionGroupId?: string;
  name: string;
  active: boolean;
  priceDelta: number;
  sortOrder?: number;
};

type Props = {
  title?: string;
  options: Option[];
  defaultExpanded?: boolean;
  maxSelect?: number;
  onChangeChoice?: (groupLabel: string, optionId: string, value: boolean) => void;
};

export default function OptionWrapper({
  title = "Options",
  options,
  defaultExpanded = true,
  maxSelect,
  onChangeChoice,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const sortedOptions: OptionItem[] = useMemo(
    () =>
      (options ?? [])
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((o) => ({
          id: o.id,
          name: o.name,
          priceDelta: o.priceDelta,
          active: !!o.active,
        })),
    [options]
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

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center mb-2 px-0 py-4">
        <Text className="flex-1 text-2xl font-semibold text-gray-900">
          {title}
        </Text>

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

      {/* Body */}
      {expanded && (
        <View className="bg-white rounded-2xl p-2 border border-gray-200">
          {sortedOptions.length === 0 ? (
            <View className="items-center py-4">
              <Text className="text-gray-500 text-base font-medium">
                No options available
              </Text>
            </View>
          ) : (
            <OptionList
              title={undefined}
              options={sortedOptions}
              maxSelect={maxSelect ?? sortedOptions.length}
              onToggle={(optionId, value) => onChangeChoice?.(title, optionId, value)}
            />
          )}
        </View>
      )}
    </View>
  );
}
