// components/store/BusinessHoursForm.tsx
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export type DayHour = { day: string; open: Date; close: Date; closed: boolean };

type Props = {
  hours: DayHour[];
  error?: string | null;
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
  openPicker: (index: number, field: "open" | "close") => void;
  setClosedState: (index: number, closed: boolean) => void;
  bottomPadding: number;
  fmtTime: (d: Date) => string;
};

export default function BusinessHoursForm({
  hours,
  error,
  canSave,
  saving,
  onSave,
  openPicker,
  setClosedState,
  bottomPadding,
  fmtTime,
}: Props) {
  return (
    <ScrollView
      className="flex-1 px-5 mt-5"
      contentContainerStyle={{ paddingBottom: bottomPadding + 24 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {error && (
        <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
          <Text className="text-red-600 text-[14px]">{error}</Text>
        </View>
      )}

      {/* 🔲 One frame around all days */}
      <View className="mb-4 rounded-2xl border border-gray-200 bg-[#FFFDF7] px-4 py-6 shadow-[0px_2px_6px_rgba(15,23,42,0.04)]">
        {hours.map((item, i) => (
          <View
            key={`${item.day}-${i}`}
            className={i === 0 ? "" : "mt-5"} // just spacing, no per-day border
          >
            {/* Top row: day + OPEN/CLOSED toggle */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[16px] font-semibold text-[#11181C]">
                {item.day}
              </Text>

              {/* Open/Closed segmented buttons */}
              <View className="flex-row rounded-full bg-[#FFF5D1] p-1">
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

            {/* Time row */}
            {item.closed ? (
              <View className="py-2 items-center">
                <Text className="text-[14px] text-gray-500 italic">
                  This day is closed.
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                  <Pressable
                    onPress={() => openPicker(i, "open")}
                    className="h-11 border border-gray-300 rounded-xl px-3 flex-row items-center justify-center active:bg-gray-50"
                  >
                    <Text className="text-[15px] text-[#11181C]">
                      {fmtTime(item.open)}
                    </Text>
                  </Pressable>
                </View>

                <Text className="text-[#11181C] mx-1">-</Text>

                <View className="flex-1 ml-2">
                  <Pressable
                    onPress={() => openPicker(i, "close")}
                    className="h-11 border border-gray-300 rounded-xl px-3 flex-row items-center justify-center active:bg-gray-50"
                  >
                    <Text className="text-[15px] text-[#11181C]">
                      {fmtTime(item.close)}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      <Pressable
        onPress={onSave}
        disabled={!canSave}
        className={`mt-4 w-full rounded-2xl py-4 items-center justify-center ${
          canSave ? "bg-[#26BD68]" : "bg-gray-300"
        }`}
      >
        <Text className="text-white text-[16px] font-semibold">
          {saving ? "Saving..." : "Save"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}