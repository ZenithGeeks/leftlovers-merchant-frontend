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
  if (leftoverQty <= 0) return { label: "Out of Stock", bg: "#FEE2E2", text: "#991B1B" };
  if (leftoverQty < 3) return { label: "Low Stock", bg: "#FEF3C7", text: "#B45309" };
  return { label: "In Stock", bg: "#DCFCE7", text: "#166534" };
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

  // unified border radius & scale
  const borderRadius = 14;
  const imageSize = isSmall ? 70 : isLarge ? 110 : 90;
  const padding = isSmall ? 10 : isLarge ? 16 : 12;
  const gap = isSmall ? 10 : isLarge ? 18 : 14;
  const fontScale = isLarge ? 1.1 : 1;
  const { label, bg, text } = getStatusStyle(leftoverQty);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap,
          padding,
          borderRadius,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        },
        pressed && { opacity: 0.95, transform: [{ scale: 0.995 }] },
      ]}
    >
      {/* Image */}
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius,
          backgroundColor: "#F3F4F6",
        }}
        contentFit="cover"
        transition={120}
      />

      {/* Text Info */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: Fonts.bold,
            fontSize: 14 * fontScale,
            color: "#11181C",
            flexShrink: 1,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {title}
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontFamily: Fonts.regular,
            fontSize: 13 * fontScale,
            color: "#4B5563",
          }}
        >
          {price.toFixed(0)} THB
        </Text>

        <View
          style={{
            marginTop: 8,
            alignSelf: "flex-start",
            backgroundColor: bg,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 12 * fontScale,
              color: text,
            }}
          >
            {label}
          </Text>
        </View>
      </View>

      {/* Orders */}
      <View style={{ alignItems: "flex-end", minWidth: isSmall ? 60 : 80 }}>
        <Text
          style={{
            fontFamily: Fonts.bold,
            fontSize: 16 * fontScale,
            color: "#11181C",
          }}
        >
          {orders}
        </Text>
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
              fontSize: 12 * fontScale,
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
