import { Fonts } from "@/constants/theme";
import React from "react";
import { Pressable, Text, View } from "react-native";

type IconType = React.ComponentType<any>;

interface InformationCardProps {
  icon: IconType;
  count: number | string;
  label: string;
  footer?: string;
  onPress?: () => void;

  backgroundColor?: string;
  textColor?: string;
  iconBackground?: string;
  iconColor?: string;
}

export default function InformationCard({
  icon: Icon,
  count,
  label,
  footer,
  onPress,
  backgroundColor = "#FFFFFF",
  textColor = "#11181C",
  iconBackground = "#ECFDF5",
  iconColor = "#26BD68",
}: InformationCardProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      className="
        flex-1
        rounded-3xl
        p-4
        overflow-hidden
        border
        border-neutral-300
        shadow-lg
        bg-white
      "
      style={[
        { backgroundColor },
        onPress && {
          transform: [{ scale: 1 }],
        },
      ]}
    >
      {/* ✅ INNER STROKE (this makes the edge visible) */}
      <View
        pointerEvents="none"
        className="absolute inset-0 rounded-3xl border border-white/90"
      />

      {/* HEADER ROW */}
      <View className="flex-row items-center justify-between">
        <View
          className="h-12 w-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: iconBackground }}
        >
          <Icon size={22} color={iconColor} />
        </View>

        {onPress && (
          <Text className="text-neutral-400 text-xl leading-none">›</Text>
        )}
      </View>

      {/* CONTENT */}
      <View className="mt-3">
        <Text
          className="text-3xl"
          style={{
            fontFamily: Fonts.bold,
            color: textColor,
            lineHeight: 34,
          }}
        >
          {count}
        </Text>

        <Text
          className="text-sm mt-1"
          style={{
            fontFamily: Fonts.medium,
            color: textColor,
          }}
        >
          {label}
        </Text>

        {footer && (
          <Text
            className="text-xs mt-2 text-neutral-500"
            style={{ fontFamily: Fonts.medium }}
          >
            {footer}
          </Text>
        )}
      </View>
    </Container>
  );
}
