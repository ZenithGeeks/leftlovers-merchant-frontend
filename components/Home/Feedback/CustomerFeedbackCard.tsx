import { Fonts } from "@/constants/theme";
import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { StarIcon as StarOutline } from "react-native-heroicons/outline";
import {
  ChevronRightIcon,
  StarIcon as StarSolid,
} from "react-native-heroicons/solid";

type Distribution = Record<1 | 2 | 3 | 4 | 5, number>;

type Props = {
  title?: string;
  average: number;
  totalReviews: number;
  distribution: Distribution;
  warnings?: number;
  onPress?: () => void;
};

export default function CustomerFeedbackCard({
  title = "Customer Feedback",
  average,
  totalReviews,
  distribution,
  warnings = 0,
  onPress,
}: Props) {
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const roundedAvg = Math.round(average * 2) / 2;
  const total = Math.max(
    totalReviews,
    Object.values(distribution).reduce((a, b) => a + b, 0)
  );

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;

    return Array.from({ length: 5 }).map((_, i) => {
      const idx = i + 1;
      if (idx <= full)
        return <StarSolid key={i} size={16} color="#FACC15" />;
      if (idx === full + 1 && half)
        return (
          <View key={i} className="relative w-4 h-4">
            <StarOutline size={16} color="#E5E7EB" />
            <View className="absolute left-0 w-1/2 overflow-hidden">
              <StarSolid size={16} color="#FACC15" />
            </View>
          </View>
        );
      return <StarOutline key={i} size={16} color="#E5E7EB" />;
    });
  };

  const renderBar = (star: 1 | 2 | 3 | 4 | 5) => {
    const count = distribution[star] ?? 0;
    const pct = total > 0 ? (count / total) * 100 : 0;

    return (
      <View key={star} className="flex-row items-center gap-2">
        <Text
          className="w-4 text-right text-slate-900 text-[16px]"
          style={{ fontFamily: Fonts.bold }}
        >
          {star}
        </Text>

        <View className="flex-1 h-[6px] bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-yellow-400"
            style={{ width: `${pct}%` }}
          />
        </View>

        <Text
          className="w-8 text-right text-gray-500 text-[12px]"
          style={{ fontFamily: Fonts.medium }}
        >
          {count}
        </Text>
      </View>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm active:opacity-90 active:scale-[0.99] p-4"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <Text
          className="flex-1 text-[20px] text-slate-900"
          style={{ fontFamily: Fonts.bold }}
        >
          {title}
        </Text>
        <View className="w-[34px] h-[34px] rounded-full bg-gray-200 items-center justify-center">
          <ChevronRightIcon size={18} color="#11181C" />
        </View>
      </View>

      {/* Body */}
      <View className="flex-row items-center gap-4">
        {/* Distribution */}
        <View className="flex-1 gap-2">
          {[5, 4, 3, 2, 1].map((s) => renderBar(s as 1 | 2 | 3 | 4 | 5))}
        </View>

        {/* Summary */}
        <View
          className="items-center"
          style={{ width: isSmall ? 108 : 120 }}
        >
          <Text
            className="text-slate-900 leading-10"
            style={{ fontFamily: Fonts.bold, fontSize: 28 }}
          >
            {roundedAvg.toFixed(1)}
          </Text>

          <View className="flex-row mt-1 gap-[2px]">
            {renderStars(roundedAvg)}
          </View>

          <Text
            className="mt-1 text-gray-500 text-[13px]"
            style={{ fontFamily: Fonts.regular }}
          >
            {totalReviews} reviews
          </Text>

          {warnings > 0 && (
            <Text
              className="mt-1 text-red-500 text-[13px]"
              style={{ fontFamily: Fonts.bold }}
            >
              {warnings} warning{warnings > 1 ? "s" : ""}!
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
