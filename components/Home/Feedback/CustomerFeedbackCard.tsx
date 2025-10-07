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

  const pad = isSmall ? 12 : 16;
  const radius = 20;
  const barTrack = "#E5E7EB";
  const barFill = "#FACC15";
  const starColor = "#FACC15";

  /** Round rating to nearest 0.5 for half-stars */
  const roundedAvg = Math.round(average * 2) / 2;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    return Array.from({ length: 5 }).map((_, i) => {
      const index = i + 1;
      if (index <= fullStars)
        return <StarSolid key={i} size={16} color={starColor} />;
      if (index === fullStars + 1 && hasHalf)
        return (
          <View key={i} style={{ width: 16, height: 16, position: "relative" }}>
            <StarOutline size={16} color={barTrack} />
            <View
              style={{
                position: "absolute",
                left: 0,
                width: "50%",
                overflow: "hidden",
              }}
            >
              <StarSolid size={16} color={starColor} />
            </View>
          </View>
        );
      return <StarOutline key={i} size={16} color={barTrack} />;
    });
  };

  const total = Math.max(
    totalReviews,
    Object.values(distribution).reduce((a, b) => a + b, 0)
  );

  const renderBar = (star: 1 | 2 | 3 | 4 | 5) => {
    const count = distribution[star] ?? 0;
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
      <View
        key={star}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <Text
          style={{
            width: 16,
            textAlign: "right",
            fontFamily: Fonts.bold,
            fontSize: 16,
            color: "#11181C",
          }}
        >
          {star}
        </Text>
        <View
          style={{
            flex: 1,
            height: 6,
            borderRadius: 999,
            backgroundColor: barTrack,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${pct}%`,
              height: "100%",
              backgroundColor: barFill,
            }}
          />
        </View>
        <Text
          style={{
            width: 36,
            textAlign: "right",
            fontFamily: Fonts.medium,
            fontSize: 13,
            color: "#6B7280",
          }}
        >
          {count}
        </Text>
      </View>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          padding: pad,
          borderRadius: radius,
          backgroundColor: "#FFF",
          borderWidth: 1,
          borderColor: "#D9D9D9",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
        pressed && { opacity: 0.96 },
      ]}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.bold,
            fontSize: 20,
            color: "#11181C",
          }}
        >
          {title}
        </Text>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: "#E5E7EB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRightIcon size={18} color="#11181C" />
        </View>
      </View>

      {/* Body */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          marginTop: 12,
        }}
      >
        {/* Left: bars */}
        <View style={{ flex: 1, gap: 10 }}>
          {[5, 4, 3, 2, 1].map((s) => renderBar(s as 1 | 2 | 3 | 4 | 5))}
        </View>

        {/* Right: summary */}
        <View style={{ width: isSmall ? 108 : 120, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 34,
              color: "#11181C",
              lineHeight: 40,
            }}
          >
            {roundedAvg.toFixed(1)}
          </Text>

          <View style={{ flexDirection: "row", gap: 2, marginTop: 4 }}>
            {renderStars(roundedAvg)}
          </View>

          <Text
            style={{
              marginTop: 6,
              fontFamily: Fonts.regular,
              fontSize: 13,
              color: "#6B7280",
            }}
          >
            {totalReviews} reviews
          </Text>

          {warnings > 0 && (
            <Text
              style={{
                marginTop: 4,
                fontFamily: Fonts.bold,
                fontSize: 13,
                color: "#EF4444",
              }}
            >
              {warnings} warning!
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
