import { Fonts } from "@/constants/theme";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { ShoppingBagIcon } from "react-native-heroicons/outline";

export type PopularMenuItemProps = {
  imageUrl: string;
  title: string;
  price: number;
  leftoverQty: number;
  orders: number;
  onPress?: () => void;
};

function getStatusStyle(leftoverQty: number) {
  if (leftoverQty <= 0) {
    return { label: "Out of Stock", bg: "#EF444440", text: "#991B1B" };
  }
  if (leftoverQty < 3) {
    return { label: "Low Stock", bg: "#FACC1540", text: "#B45309" };
  }
  return { label: "In-Stock", bg: "#26BD6840", text: "#0E7A3B" };
}

export default function PopularMenuItem({
  imageUrl,
  title,
  price,
  orders,
  leftoverQty,
  onPress,
}: PopularMenuItemProps) {
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const isLarge = width >= 768;

  const imageSize = isSmall ? 72 : isLarge ? 112 : 92;
  const pad = isSmall ? 10 : isLarge ? 16 : 12;
  const gap = isSmall ? 10 : isLarge ? 18 : 14;
  const titleSize = isSmall ? 12 : isLarge ? 18 : 14;
  const priceSize = isSmall ? 13 : isLarge ? 18 : 14;
  const ordersSize = isSmall ? 18 : isLarge ? 18 : 14;
  const labelSize = isSmall ? 12 : isLarge ? 16 : 13;
  const pillPx = isSmall ? 10 : 14;
  const pillPy = isSmall ? 5 : 6;

  const { label, bg, text } = getStatusStyle(leftoverQty);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap,
          padding: pad,
          borderRadius: 18,
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#EAEAEA",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        },
        pressed && { opacity: 0.95, transform: [{ scale: 0.997 }] },
      ]}
    >
      {/* Left: image */}
      <Image
        source={{ uri: imageUrl }}
        style={{ width: imageSize, height: imageSize, borderRadius: 16 }}
        contentFit="cover"
        transition={120}
      />

      {/* Middle: name, price, status */}
      <View style={{ flex: 1, minWidth: 0 }}>
        {/* Menu name wraps into multiple lines */}
        <Text
          style={{
            fontFamily: Fonts.bold,
            fontSize: titleSize,
            color: "#11181C",
            flexShrink: 1,
            flexWrap: "wrap",
            lineHeight: titleSize + 4,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontFamily: Fonts.regular,
            fontSize: priceSize,
            color: "#4B5563",
          }}
        >
          {price.toFixed(0)} THB
        </Text>

        <View
          style={{
            marginTop: 8,
            alignSelf: "flex-start",
            paddingHorizontal: pillPx,
            paddingVertical: pillPy,
            borderRadius: 999,
            backgroundColor: bg,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 12,
              color: text,
            }}
          >
            {label}
          </Text>
        </View>
      </View>

      {/* Right: orders + icon */}
      <View style={{ alignItems: "flex-end", minWidth: isSmall ? 70 : 84 }}>
        <Text
          style={{
            fontFamily: Fonts.bold,
            fontSize: ordersSize,
            color: "#11181C",
          }}
        >
          {orders}
        </Text>

        {/* Label + icon */}
        <View
          style={{
            marginTop: 2,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <ShoppingBagIcon size={14} color="#6B7280" />
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: labelSize,
              color: "#6B7280",
            }}
          >
            Orders
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
