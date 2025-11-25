import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";
import { ThemedView } from "@/components/themed-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
];

type DayHour = { day: string; open: Date; close: Date; closed: boolean };

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
function fmtTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function TimePickerModal({
  visible,
  value,
  onChange,
  onClose,
  title,
}: {
  visible: boolean;
  value: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
  title: string;
}) {
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
            value={value}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minuteInterval={5}
            is24Hour
            onChange={(_, d) => {
              if (d) onChange(d);
            }}
            // On iOS in a modal, we render inline — no native popup
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

export default function EditBusinessHours() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Seed default 15:00–19:00, Wednesday closed
  const seed = useMemo(() => {
    const mk = (h: number, m: number) => {
      const d = new Date(); d.setHours(h, m, 0, 0); return d;
    };
    return DAYS.map((d) => ({
      day: d,
      open: mk(15, 0),
      close: mk(19, 0),
      closed: d === "Wednesday",
    })) as DayHour[];
  }, []);

  const [hours, setHours] = useState<DayHour[]>(seed);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{ index: number; field: "open" | "close" } | null>(null);

  const openPicker = (index: number, field: "open" | "close") => {
    setPickerTarget({ index, field });
    setPickerOpen(true);
  };
  const closePicker = () => setPickerOpen(false);

  const setTime = (d: Date) => {
    if (!pickerTarget) return;
    setHours((prev) => {
      const next = [...prev];
      next[pickerTarget.index] = {
        ...next[pickerTarget.index],
        [pickerTarget.field]: d,
      };
      return next;
    });
  };

  const toggleClosed = (index: number) => {
    setHours((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], closed: !next[index].closed };
      return next;
    });
  };

  const onSave = async () => {
    setSaving(true);
    try {
      // TODO: persist via API
      router.back();
    } finally {
      setSaving(false);
    }
  };

  // Current value for modal
  const currentValue =
    pickerTarget ? hours[pickerTarget.index][pickerTarget.field] : new Date();

  return (
    <ThemedView className="flex-1 bg-white" style={{ paddingTop: insets.top + 8 }}>
      {/* Header */}
      <View className="px-5 pb-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="text-2xl font-bold text-[#11181C]">Edit Business Hours</Text>
        <Pressable onPress={() => router.back()}>
          <XMarkIcon size={22} color="#11181C" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5">
        {hours.map((item, i) => (
          <View key={item.day} className="flex-row items-center justify-between py-3">
            <Text className="text-[16px] font-semibold text-[#11181C] w-28">
              {item.day}
            </Text>

            {item.closed ? (
              <View className="flex-1 items-center">
                <Text className="text-gray-500 italic">Closed</Text>
              </View>
            ) : (
              <View className="flex-row gap-2 flex-1 justify-center">
                <Pressable
                  onPress={() => openPicker(i, "open")}
                  className="min-w-[84px] border border-gray-300 rounded-xl px-3 py-2 items-center justify-center active:bg-gray-50"
                >
                  <Text className="text-[16px] text-[#11181C]">{fmtTime(item.open)}</Text>
                </Pressable>
                <Text className="text-[#11181C] self-center">–</Text>
                <Pressable
                  onPress={() => openPicker(i, "close")}
                  className="min-w-[84px] border border-gray-300 rounded-xl px-3 py-2 items-center justify-center active:bg-gray-50"
                >
                  <Text className="text-[16px] text-[#11181C]">{fmtTime(item.close)}</Text>
                </Pressable>
              </View>
            )}

            <Pressable onPress={() => toggleClosed(i)}>
              <Text className="text-sm text-[#26BD68] font-semibold">
                {item.closed ? "Open" : "Close"}
              </Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={onSave}
          className={`mt-8 w-full rounded-2xl py-4 items-center justify-center ${
            saving ? "bg-gray-300" : "bg-[#26BD68]"
          }`}
        >
          <Text className="text-white text-[16px] font-semibold">
            {saving ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={pickerOpen}
        value={currentValue}
        onChange={setTime}
        onClose={closePicker}
        title={
          pickerTarget
            ? `${hours[pickerTarget.index].day} — ${pickerTarget.field === "open" ? "Open" : "Close"} time`
            : "Select time"
        }
      />
    </ThemedView>
  );
}
