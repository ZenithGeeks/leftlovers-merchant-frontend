import { Fonts } from "@/constants/theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Switch, Text, View } from "react-native";
// Import TrashIcon for the new delete button
import { PencilSquareIcon, TrashIcon } from "react-native-heroicons/outline";
import ToastManager, { Toast } from "toastify-react-native";

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
  onDelete?: (id: string) => void; // New onDelete prop
};

export default function MenuList({ items, onToggle, onDelete }: Props) {
  const [localItems, setLocalItems] = useState(items);
  const router = useRouter();

  const toggleItem = (id: string, value: boolean) => {
    const updated = localItems.map((item) =>
      item.id === id ? { ...item, inStock: value } : item
    );
    setLocalItems(updated);
    onToggle?.(id, value);
  };

  // --- NEW: Delete handler with confirmation alert ---
  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      `Delete "${name}"`,
      "Are you sure you want to delete this item? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            // Optimistically update the UI by removing the item locally
            setLocalItems((prevItems) => prevItems.filter((item) => item.id !== id));
            // Call the parent onDelete handler to perform the actual deletion
            onDelete?.(id);
          },
          style: "destructive",
        },
      ]
    );
  };

  if (!localItems || localItems.length === 0) {
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
        return (
          <View
            key={item.id}
            className={`flex flex-row items-center py-4 gap-3 ${
              !isLast ? "border-b border-gray-100" : ""
            }`}
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
                  className={`text-xs ${
                    item.inStock ? "text-green-700" : "text-gray-500"
                  }`}
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
                accessibilityState={{ checked: item.inStock }}
                value={item.inStock}
                onValueChange={(val) => {
                  if (val && item.leftoverQty === 0) {
                    Toast.show({
                      type: "error",
                      text1: "Cannot mark as in-stock with 0 quantity",
                      position: "bottom",
                    });
                  } else {
                    toggleItem(item.id, val);
                  }
                }}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={item.inStock ? "#16A34A" : "#F4F4F5"}
              />
              {/* --- NEW: Wrapper for edit and delete buttons --- */}
              <View className="flex-row items-center justify-end">
                <Pressable
                  onPress={() => router.push(`/edit-item/${item.id}`)}
                  className="p-2"
                  accessibilityLabel={`edit-${item.name}`}
                >
                  <PencilSquareIcon size={18} color="#696969" />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id, item.name)}
                  className="p-2"
                  accessibilityLabel={`delete-${item.name}`}
                >
                  <TrashIcon size={18} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
      <ToastManager />
    </View>
  );
}