import type { OrderItem } from "@/types/types";
import React from "react";
import { Text, View } from "react-native";

interface CardItemProps {
  orderItem: OrderItem;
}

export default function CardItem({ orderItem }: CardItemProps) {
  const qty = orderItem.quantity ?? 0;
  const menuName = orderItem.menu?.name ?? "Menu item";

  return (
    <View className="flex-row items-start py-3 border-b border-gray-100">
      {/* qty bubble */}
      <View className="w-7">
        <View className="border border-green-500 rounded-full w-6 h-6 justify-center items-center">
          <Text className="text-green-600 text-[10px] font-semibold">
            {qty}
          </Text>
        </View>
      </View>

      {/* item content */}
      <View className="flex-1 ml-3">
        <Text className="text-sm font-semibold text-gray-900">
          {menuName}
        </Text>

        {/* options */}
        {!!orderItem.options?.length && (
          <View className="mt-1">
            {orderItem.options.map((opt) => (
              <Text
                key={opt.id}
                className="text-[11px] text-gray-600"
              >
                {opt.option?.name ?? "Option"}
                {" "}
                <Text className="text-gray-400">•</Text>
                {" "}
                +{opt.priceDelta ?? opt.option?.priceDelta ?? "0"}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
