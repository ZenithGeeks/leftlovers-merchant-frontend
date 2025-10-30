import { Fonts } from "@/constants/theme";
import { DeleteMenuItem } from "@/services/menu";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Switch, Text, View } from "react-native";
import { PencilSquareIcon, TrashIcon } from "react-native-heroicons/outline";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  leftoverQty: number;
  imageUrl: string;
  inStock: boolean;
};

type Props = {
  items: MenuItem[];
  onToggle?: (id: string, value: boolean) => void;
  onDelete?: (id: string) => void; // let parent refresh if needed
  merchantId?: string;             // default used if not provided
};

export default function MenuList({
  items,
  onToggle,
  onDelete,
  merchantId = "c4c9f4f8-2315-4b1e-8d55-6a8f85bb599f",
}: Props) {
  const [localItems, setLocalItems] = useState<MenuItem[]>(items);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // keep localItems in sync when parent items change
  useEffect(() => setLocalItems(items), [items]);

  const toggleItem = (id: string, value: boolean) => {
    setLocalItems(prev => prev.map(it => it.id === id ? { ...it, inStock: value } : it));
    onToggle?.(id, value);
  };

  const handleDelete = (menuId: string) => {
    Alert.alert(
      "Delete item",
      "This action cannot be undone. Do you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // optimistic update
            setDeletingId(menuId);
            const prev = localItems;
            setLocalItems(p => p.filter(i => i.id !== menuId));
            try {
              await DeleteMenuItem(merchantId, menuId);
              onDelete?.(menuId); // let parent refetch if desired
            } catch (err: any) {
              // rollback on failure
              setLocalItems(prev);
              Alert.alert("Error", err?.message ?? "Failed to delete menu item.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (!localItems.length) {
    return (
      <View className="rounded-2xl p-4 bg-white shadow">
        <Text className="text-gray-500">No items</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-col rounded-2xl px-4 bg-white">
      {localItems.map((item, idx) => {
        const isLast = idx === localItems.length - 1;
        const isDeleting = deletingId === item.id;

        return (
          <View
            key={item.id}
            className={`flex flex-row items-center py-4 gap-3 ${!isLast ? "border-b border-gray-100" : ""}`}
          >
            <Image
              source={{ uri: item.imageUrl }}
              className="bg-neutral-100"
              style={{ width: 100, height: 100, borderRadius: 14 }}
              contentFit="cover"
              transition={120}
            />

            <View className="flex-1 flex-col">
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
                className={`self-start mt-1 px-2.5 py-1 rounded-full ${
                  item.inStock ? "bg-green-100" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-xs ${item.inStock ? "text-green-700" : "text-gray-500"}`}
                  style={{ fontFamily: Fonts.medium }}
                >
                  {item.inStock ? "In-Stock:" : "Out of Stock:"} {item.leftoverQty}
                </Text>
              </View>
            </View>

            <View className="items-center justify-between py-2 h-[100px]">
              <Switch
                accessibilityRole="switch"
                accessibilityLabel={`${item.name}-switch`}
                accessibilityState={{ checked: item.inStock, disabled: isDeleting }}
                value={item.inStock}
                disabled={isDeleting}
                onValueChange={(val) => {
                  if (val && item.leftoverQty === 0) {
                    Alert.alert("Cannot enable", "No stock left.");
                  } else {
                    toggleItem(item.id, val);
                  }
                }}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={item.inStock ? "#16A34A" : "#F4F4F5"}
              />

              <View className="flex-row items-center justify-end">
                <Pressable
                  disabled={isDeleting}
                  onPress={() => router.push(`/edit-item/${item.id}`)}
                  className="p-2"
                  accessibilityLabel={`edit-${item.name}`}
                >
                  <PencilSquareIcon size={18} color="#696969" />
                </Pressable>

                <Pressable
                  disabled={isDeleting}
                  onPress={() => handleDelete(item.id)}
                  className="p-2"
                  accessibilityLabel={`delete-${item.name}`}
                >
                  {isDeleting ? (
                    <ActivityIndicator />
                  ) : (
                    <TrashIcon size={18} color="#EF4444" />
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
