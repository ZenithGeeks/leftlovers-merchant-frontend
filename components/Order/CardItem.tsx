import type { OrderItem } from "@/types/types";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

interface CardItemProps {
  orderItem: OrderItem;
}

function computeItemMoney(orderItem: OrderItem) {
  const qty = orderItem.quantity ?? 0;

  const basePrice = Number(orderItem.menu?.basePrice ?? 0);

  const optionsDeltaTotal = (orderItem.options ?? []).reduce((sum, opt) => {
    const delta = Number(opt.priceDelta ?? opt.option?.priceDelta ?? 0);
    return sum + (Number.isNaN(delta) ? 0 : delta);
  }, 0);

  const unitPrice = basePrice + optionsDeltaTotal;
  const lineTotal = unitPrice * qty;

  return { basePrice, optionsDeltaTotal, unitPrice, lineTotal };
}

export default function CardItem({ orderItem }: CardItemProps) {
  const qty = orderItem.quantity ?? 0;
  const menuName = orderItem.menu?.name ?? "Menu item";

  const money = useMemo(() => computeItemMoney(orderItem), [orderItem]);

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
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-2">
            <Text className="text-sm font-semibold text-gray-900">
              {menuName}
            </Text>

            {/* options */}
            {!!orderItem.options?.length && (
              <View className="mt-1">
                {orderItem.options.map((opt) => {
                  const price =
                    Number(opt.priceDelta ?? opt.option?.priceDelta ?? 0) || 0;

                  return (
                    <Text
                      key={opt.id}
                      className="text-[11px] text-gray-600"
                    >
                      {opt.option?.name ?? "Option"}
                      {"  "}
                      <Text className="text-gray-400">•</Text>
                      {"  "}
                      {price !== 0 ? `+฿${price}` : "+฿0"}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>

          {/* price block */}
          <View className="items-end">
            <Text className="text-xs text-gray-500">
              ฿{money.unitPrice.toFixed(0)} / item
            </Text>
            <Text className="text-xs text-gray-400">
              ({qty} × ฿{money.unitPrice.toFixed(0)})
            </Text>
            <Text className="mt-1 text-sm font-semibold text-gray-900">
              ฿{money.lineTotal.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
