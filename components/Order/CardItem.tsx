import { OrderItem } from "@/constants/order.type";
import React from "react";
import {
  View,
  Text,
} from "react-native";


interface CardItemProps {
  orderItem: OrderItem;
};

export default function CardItem({
  orderItem,
}: CardItemProps) {
  return (
    <View className="px-5 flex-row justify-between items-start mt-6">
      <View className="items-start">
        <View className="border border-green-500 rounded-full w-6 h-6 justify-center items-center">
          <Text className="text-green-600 font-poppins text-xs">
            {orderItem.quantity}
          </Text>
        </View>
      </View>
      {/* Food Info */}
      <View className="flex-1 mx-3">
        <Text className="font-poppins mb-1">{orderItem.name}</Text>

        {/* Render options dynamically */}
        {orderItem.options?.map((opt, index) => (
          <Text key={index} className="font-poppins text-xs pb-0.5">
            {opt.label}: {opt.value}
          </Text>
        ))}

        {orderItem.note && (
          <Text className="text-gray font-poppins text-xs" numberOfLines={2}>
            {orderItem.note}
          </Text>
        )}
      </View>
    </View>
  );
}
