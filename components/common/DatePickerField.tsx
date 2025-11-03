import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

type Props = {
  label?: string;
  value?: Date | null;
  onChange: (d: Date | null) => void;
  minimumDate?: Date;
};

export default function DatePickerField({
  label = "Expire Date",
  value,
  onChange,
  minimumDate = new Date(),
}: Props) {
  const [open, setOpen] = useState(false);
  const displayText = useMemo(() => {
    if (!value) return "Select a date";
    return value.toLocaleDateString();
  }, [value]);

  const onChangeInner = (e: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setOpen(false);
    if (e.type === "set" && date) onChange(date);
  };

  return (
    <View className="w-full">
      <Text className="mb-2 text-[16px] font-semibold text-[#11181C]">
        {label} <Text className="text-red-500">*</Text>
      </Text>

      <Pressable
        onPress={() => setOpen(true)}
        className="h-14 flex-row items-center justify-between rounded-2xl border border-dashed border-gray-400 px-4 active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel="expire-date-button"
      >
        <Text className={`text-[16px] ${value ? "text-[#11181C]" : "text-gray-400"}`}>
          {displayText}
        </Text>
        <Text className="text-[#11181C]">📅</Text>
      </Pressable>

      {open && (
        <View>
          <DateTimePicker
            value={value ?? minimumDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            minimumDate={minimumDate}
            onChange={onChangeInner}
          />
          {Platform.OS === "ios" && (
            <View className="mt-2 flex-row justify-end">
              <Pressable
                onPress={() => setOpen(false)}
                className="rounded-xl bg-emerald-600 px-4 py-2 active:opacity-90"
              >
                <Text className="text-white">Done</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
