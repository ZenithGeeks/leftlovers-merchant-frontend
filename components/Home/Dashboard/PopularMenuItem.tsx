import { Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ShoppingBagIcon } from 'react-native-heroicons/outline';

export type PopularMenuItemProps = {
  imageUrl: string;
  title: string;
  price: number;
  leftoverQty: number;
  orders: number;
  onPress?: () => void;
};

function statusClasses(leftoverQty: number) {
  if (leftoverQty <= 0) return { label: 'Out of Stock', bg: 'bg-red-100', text: 'text-red-900' };
  if (leftoverQty < 3) return { label: 'Low Stock', bg: 'bg-amber-100', text: 'text-amber-700' };
  return { label: 'In Stock', bg: 'bg-emerald-100', text: 'text-emerald-700' };
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

  const borderRadius = 14;
  const imageSize = isSmall ? 70 : isLarge ? 110 : 90;
  const padding = isSmall ? 10 : isLarge ? 16 : 12;
  const gap = isSmall ? 10 : isLarge ? 18 : 14;
  const fontScale = isLarge ? 1.1 : 1;
  const status = statusClasses(leftoverQty);

  return (
    <Pressable
      onPress={onPress}
      className="bg-white border border-neutral-200 rounded-2xl"
      style={{
        padding,
        gap,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View className="flex-row items-center" style={{ gap }}>
        <Image
          source={{ uri: imageUrl }}
          className="bg-neutral-100"
          style={{ width: imageSize, height: imageSize, borderRadius }}
          contentFit="cover"
          transition={120}
        />

        <View className="flex-1 min-w-0">
          <Text
            numberOfLines={2}
            className="text-slate-900"
            style={{
              fontFamily: Fonts.bold,
              fontSize: 14 * fontScale,
              lineHeight: 20,
            }}
          >
            {title}
          </Text>

          <Text
            className="text-slate-600 mt-1"
            style={{ fontFamily: Fonts.regular, fontSize: 13 * fontScale }}
          >
            {price.toFixed(0)} THB
          </Text>

          <View className={`self-start mt-2 px-3 py-1 rounded-full ${status.bg}`}>
            <Text
              className={status.text}
              style={{ fontFamily: Fonts.medium, fontSize: 12 * fontScale }}
            >
              {status.label}
            </Text>
          </View>
        </View>

        <View className="items-end" style={{ minWidth: isSmall ? 60 : 80 }}>
          <Text
            className="text-slate-900"
            style={{ fontFamily: Fonts.bold, fontSize: 16 * fontScale }}
          >
            {orders}
          </Text>

          <View className="flex-row items-center mt-0.5">
            <ShoppingBagIcon size={14} color="#6B7280" />
            <Text
              className="text-slate-500 ml-1"
              style={{ fontFamily: Fonts.regular, fontSize: 12 * fontScale }}
            >
              Orders
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
