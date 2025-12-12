// components/store/TimePickerModal.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  value: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
  title: string;
};


function timeBase(d: Date) {
  const base = new Date(1970, 0, 1);
  base.setHours(d.getHours(), d.getMinutes(), 0, 0);
  return base;
}

const MIN_TIME = new Date(1970, 0, 1, 0, 0);
const MAX_TIME = new Date(1970, 0, 1, 23, 59);

export default function TimePickerModal({
  visible,
  value,
  onChange,
  onClose,
  title,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />

      {/* Sheet */}
      <View className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl p-4">
        <Text className="text-center text-[16px] font-semibold text-[#11181C] mb-2">
          {title}
        </Text>

        <View className="items-center">
          <DateTimePicker
              value={timeBase(value)}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minuteInterval={5}
              is24Hour
              minimumDate={MIN_TIME}
              maximumDate={MAX_TIME}
              onChange={(_, d) => {
                if (d) onChange(timeBase(d));
              }}
              themeVariant="light"
            />
        </View>

        <Pressable
          onPress={onClose}
          className="mt-4 w-full rounded-2xl py-3 items-center justify-center bg-[#26BD68]"
        >
          <Text className="text-white text-[16px] font-semibold">Done</Text>
        </Pressable>
      </View>
    </Modal>
  );
}