// components/store/AuthBusinessHoursForm.tsx
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export type DayHour = { day: string; open: Date; close: Date; closed: boolean };

type Props = {
  hours: DayHour[];
  error?: string | null;
  openPicker: (index: number, field: "open" | "close") => void;
  setClosedState: (index: number, closed: boolean) => void;
  bottomPadding: number;
  fmtTime: (d: Date) => string;
};

export default function AuthBusinessHoursForm({
  hours,
  error,
  openPicker,
  setClosedState,
  bottomPadding,
  fmtTime,
}: Props) {
  return (
    <ScrollView
      className="flex-1 px-0 mt-5"
      contentContainerStyle={{ paddingBottom: bottomPadding + 24 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      pointerEvents="box-none"   // ⭐ FIX: allow time picker wheels to scroll
    >
      {error && (
        <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
          <Text className="text-red-600 text-[14px]">{error}</Text>
        </View>
      )}

      {/* 🌿 Wrapper */}
      <View
        style={{
          backgroundColor: "rgba(38, 189, 104, 0.2)",
          borderWidth: 0.5,
          borderColor: "rgba(38, 189, 104, 0.05)",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      >
        {hours.map((item, i) => (
          <View key={`${item.day}-${i}`} style={{ marginTop: i === 0 ? 0 : 20 }}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[16px] font-semibold text-[#11181C]">
                {item.day}
              </Text>

              {/* OPEN / CLOSED Toggle */}
              <View className="flex-row rounded-full bg-[#FFF5D1] p-1">
                {/* OPEN */}
                <Pressable
                  onPress={() => setClosedState(i, false)}
                  className={`px-3 py-1.5 rounded-full ${
                    !item.closed ? "bg-[#FECD4C]" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      !item.closed ? "text-[#11181C]" : "text-[#6B7280]"
                    }`}
                  >
                    OPEN
                  </Text>
                </Pressable>

                {/* CLOSED */}
                <Pressable
                  onPress={() => setClosedState(i, true)}
                  className={`px-3 py-1.5 rounded-full ${
                    item.closed ? "bg-[#FECD4C]" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      item.closed ? "text-[#11181C]" : "text-[#6B7280]"
                    }`}
                  >
                    CLOSED
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Time Selectors */}
            {item.closed ? (
              <View className="py-2 items-center">
                <Text className="text-[14px] text-gray-500 italic">
                  This day is closed.
                </Text>
              </View>
            ) : (
              <View className="flex-row justify-between items-center">
                {/* OPEN */}
                <Pressable
                  onPress={() => openPicker(i, "open")}
                  className="flex-1 h-11 border border-gray-300 rounded-xl mr-2 px-3 items-center justify-center active:bg-gray-100"
                >
                  <Text className="text-[15px] text-[#11181C]">
                    {fmtTime(item.open)}
                  </Text>
                </Pressable>

                <Text className="mx-1 text-[#11181C]">-</Text>

                {/* CLOSE */}
                <Pressable
                  onPress={() => openPicker(i, "close")}
                  className="flex-1 h-11 border border-gray-300 rounded-xl ml-2 px-3 items-center justify-center active:bg-gray-100"
                >
                  <Text className="text-[15px] text-[#11181C]">
                    {fmtTime(item.close)}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
