import { Fonts } from "@/constants/theme";
import { DeleteMenuItem, updateMenuStatus } from "@/services/menu";
import type { MenuItemAPI, MenuStatus } from "@/types/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Switch,
  Text,
  View,
} from "react-native";
import { PencilSquareIcon, TrashIcon } from "react-native-heroicons/outline";

type Props = {
  items: MenuItemAPI[];
  onToggle?: (id: string, value: boolean) => void;
  onDelete?: (id: string) => void;
  merchantId: string;
};

export default function MenuList({
  items,
  onToggle,
  onDelete,
  merchantId,
}: Props) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState<MenuItemAPI[]>(items);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => setLocalItems(items), [items]);

  const toggleItem = async (id: string, value: boolean) => {
    const nextStatus: MenuStatus = value ? "LIVE" : "DRAFT";
    setLocalItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: nextStatus } : it))
    );

    try {
      await updateMenuStatus(merchantId, id, nextStatus);
      onToggle?.(id, value);
    } catch (err: any) {
      setLocalItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, status: value ? "DRAFT" : "LIVE" } : it
        )
      );
      Alert.alert("Error", err?.message ?? "Failed to update menu status.");
    }
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
            setDeletingId(menuId);
            const prev = localItems;
            setLocalItems((p) => p.filter((i) => i.id !== menuId));

            try {
              await DeleteMenuItem(merchantId, menuId);
              onDelete?.(menuId);
            } catch (err: any) {
              setLocalItems(prev);
              Alert.alert(
                "Error",
                err?.message ?? "Failed to delete menu item."
              );
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

        const isLive = item.status === "LIVE";
        const priceNumber = Number(item.basePrice ?? 0);

        return (
          <View
            key={item.id}
            className={`flex flex-row items-center py-4 gap-3 ${
              !isLast ? "border-b border-gray-100" : ""
            }`}
          >
            <Image
              source={{ uri: item.photoUrl || "" }}
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
                {priceNumber.toLocaleString("th-TH")} THB
              </Text>

              <View
                className={`self-start mt-1 px-2.5 py-1 rounded-full ${
                  (item.leftoverQty ?? 0) > 0 ? "bg-green-100" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-xs ${
                    (item.leftoverQty ?? 0) > 0
                      ? "text-green-700"
                      : "text-gray-500"
                  }`}
                  style={{ fontFamily: Fonts.medium }}
                >
                  In-Stock: {item.leftoverQty ?? 0}
                </Text>
              </View>
            </View>

            <View className="items-center justify-between py-2 h-[100px]">
              <Switch
                accessibilityRole="switch"
                accessibilityLabel={`${item.name}-switch`}
                accessibilityState={{ checked: isLive, disabled: isDeleting }}
                value={isLive}
                disabled={isDeleting}
                onValueChange={(val) => {
                  if (val && (item.leftoverQty ?? 0) === 0) {
                    Alert.alert("Cannot enable", "No stock left.");
                    return;
                  }
                  toggleItem(item.id, val);
                }}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={isLive ? "#16A34A" : "#F4F4F5"}
              />

              <View className="flex-row items-center justify-end">
                <Pressable
                  disabled={isDeleting}
                  onPress={() =>
                    router.push({
                      pathname: "/edit-item/[id]",
                      params: {
                        id: item.id,
                      },
                    })
                  }
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
