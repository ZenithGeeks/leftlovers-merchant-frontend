import { WarningCardDTO } from "@/types/types";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { ExclamationTriangleIcon } from "react-native-heroicons/outline";
import WarningCard from "./WarningCard";

type Props = {
  data: WarningCardDTO[];
  title?: string;
  onPressWarning?: (id: string) => void;
  emptyHint?: string;
};

export default function WarningSection({
  data,
  title = "Warning",
  onPressWarning,
  emptyHint = "No active warnings",
}: Props) {
  if (!data?.length) {
    return (
        <View className="flex flex-col gap-4">
      <View className="rounded-2xl bg-white p-4 border border-gray-200">
        <View className="flex-row items-center mb-1">
          <ExclamationTriangleIcon size={18} color="#f59e0b" />
          <Text className="ml-2 text-base font-semibold text-gray-900">{title}</Text>
        </View>
        <Text className="text-gray-500">{emptyHint}</Text>
      </View>
      <Text className="text-gray-500 text-justify px-2">
        (Reminder: If a customer files more than one valid complaint against your orders, your selling privileges will be temporarily suspended for 3 days. Please make sure all orders are checked for freshness and quality before dispatch.)
      </Text>
      </View>
    );
  }

  return (
    <View className="rounded-2xl bg-white p-4 border border-gray-200">
      <View className="flex-row items-center mb-3">
        <ExclamationTriangleIcon size={18} color="#f59e0b" />
        <Text className="ml-2 text-base font-semibold text-gray-900">
          {title} <Text className="text-amber-600">({data.length})</Text>
        </Text>
      </View>

      <FlatList
        scrollEnabled={false}
        data={data}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <WarningCard item={item} onPress={() => onPressWarning?.(item.id)} />
        )}
      />
    </View>
  );

  
}
