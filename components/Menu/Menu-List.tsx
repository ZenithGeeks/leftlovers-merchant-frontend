import { Fonts } from "@/constants/theme";
import { Image } from "expo-image";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
};

type Props = {
  title?: string;
  items: MenuItem[];
  onToggle?: (id: string, value: boolean) => void;
};

export default function MenuList({ title = "Food", items, onToggle }: Props) {
  const [localItems, setLocalItems] = useState(items);

  const toggleItem = (id: string, value: boolean) => {
    const updated = localItems.map((item) =>
      item.id === id ? { ...item, inStock: value } : item
    );
    setLocalItems(updated);
    onToggle?.(id, value);
  };

  return (
    <View style={styles.container}>
      {/* Item List */}
      {localItems.map((item, idx) => (
        <View key={item.id} style={[styles.item, idx < localItems.length - 1 && styles.divider]}>
          {/* Image */}
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price} THB</Text>

            <View
              style={[
                styles.stockBadge,
                {
                  backgroundColor: item.inStock ? "#22C55E33" : "#E5E7EB",
                },
              ]}
            >
              <Text
                style={[
                  styles.stockText,
                  { color: item.inStock ? "#16A34A" : "#6B7280" },
                ]}
              >
                {item.inStock ? "In-Stock" : "Out of Stock"}
              </Text>
            </View>
          </View>

          {/* Toggle */}
          <Switch
            value={item.inStock}
            onValueChange={(val) => toggleItem(item.id, val)}
            trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
            thumbColor={item.inStock ? "#16A34A" : "#F4F4F5"}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: "#11181C",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: "#11181C",
  },
  price: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#4B5563",
    marginTop: 2,
  },
  stockBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  stockText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
});
