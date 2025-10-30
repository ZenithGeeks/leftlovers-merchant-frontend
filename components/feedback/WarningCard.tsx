
import React from "react";
import { Pressable, Text, View } from "react-native";
import { ClockIcon } from "react-native-heroicons/outline";
import WarningTag from "./WarningTag";
import { WarningCardDTO } from "@/types/types";

type Props = {
  item: WarningCardDTO;
  onPress?: () => void;
};

export default function WarningCard({ item, onPress }: Props) {
  const created = formatDate(item.createdAt);
  const expires = item.expiresAt ? formatDate(item.expiresAt) : null;

  const Container = onPress ? Pressable : View;

  return (
    <Container
      {...(onPress ? { onPress } : {})}
      className="rounded-2xl bg-amber-50 border border-amber-200 p-4 active:opacity-90"
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`warning-${item.id}`}
    >
      {/* Header */}
      <View className="flex-row items-center">
        <View className="h-10 w-10 rounded-full bg-teal-600 items-center justify-center">
          <Text className="text-white font-semibold text-[14px]">
            {initials(item.customerName)}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-gray-900 font-semibold">{item.customerName}</Text>
          <View className="flex-row items-center mt-0.5">
            <ClockIcon size={14} color="#6b7280" />
            <Text className="ml-1 text-xs text-gray-600">
              {created}
              {expires ? ` • expires ${expires}` : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Message */}
      <Text className="mt-2 text-[15px] text-gray-800 leading-5">
        “{item.message}”
      </Text>

      {/* Tags */}
      {!!item.tags?.length && (
        <View className="flex-row flex-wrap gap-2 mt-3">
          {item.tags.map((t, i) => (
            <WarningTag key={`${t}-${i}`} label={t} />
          ))}
        </View>
      )}
    </Container>
  );
}

// --- Utilities ---
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
