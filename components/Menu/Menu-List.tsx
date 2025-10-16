import { Fonts } from "@/constants/theme";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Switch, Text, View } from "react-native";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
};

type Props = {
  items: MenuItem[];
  onToggle?: (id: string, value: boolean) => void;
};

export default function MenuList({ items, onToggle }: Props) {
  const [localItems, setLocalItems] = useState(items);
  const toggleItem = (id: string, value: boolean) => {
    const updated = localItems.map((item) =>
      item.id === id ? { ...item, inStock: value } : item
    );
    setLocalItems(updated);
    onToggle?.(id, value);
  };

  if (!localItems.length) {
    return (
      <View className="rounded-2xl p-4 bg-white shadow">
        <Text className="text-gray-500">No items</Text>
      </View>
    );
  }

  return (
    <View className="rounded-2xl p-4 bg-white">
      {localItems.map((item, idx) => {
        const isLast = idx === localItems.length - 1;
        return (
          <View
            key={item.id}
            className={[
              "flex-row items-center py-4 gap-3",
              !isLast ? "border-b border-gray-100" : "",
            ].join(" ")}
          >
            {/* Image */}
             <Image
                      source={{ uri: item.imageUrl }}
                      className="bg-neutral-100"
                      style={{ width: 100, height: 100, borderRadius: 14 }}
                      contentFit="cover"
                      transition={120}
                    />

            {/* Info */}
            <View className="flex-1">
              <Text
                className="text-base text-[#11181C]"
                style={{ fontFamily: Fonts.bold }}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text
                className="mt-0.5 text-sm text-gray-600"
                style={{ fontFamily: Fonts.regular }}
              >
                {item.price.toLocaleString("th-TH")} THB
              </Text>

              <View
                className={[
                  "self-start mt-1 px-2.5 py-1 rounded-full",
                  item.inStock ? "bg-green-100" : "bg-gray-200",
                ].join(" ")}
              >
                <Text
                  className={[
                    "text-xs",
                    item.inStock ? "text-green-700" : "text-gray-500",
                  ].join(" ")}
                  style={{ fontFamily: Fonts.medium }}
                >
                  {item.inStock ? "In-Stock" : "Out of Stock"}
                </Text>
              </View>
            </View>

            {/* Toggle */}
            <Switch
              accessibilityRole="switch"
              accessibilityLabel={`${item.name}-switch`}
              accessibilityState={{ checked: item.inStock }}
              value={item.inStock}
              onValueChange={(val) => toggleItem(item.id, val)}
              trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
              thumbColor={item.inStock ? "#16A34A" : "#F4F4F5"}
            />
          </View>
        );
      })}
    </View>
  );
}
