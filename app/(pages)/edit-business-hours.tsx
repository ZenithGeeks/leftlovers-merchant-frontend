// app/(pages)/edit-business-hours.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
  type BusinessHours,
  type WeeklySchedule,
} from "@/services/store";
import { DEV_MERCHANT_ID } from "@/utils/env";

const MERCHANT_ID =
  DEV_MERCHANT_ID || process.env.EXPO_PUBLIC_MERCHANT_ID || "";

const DAY_META = [
  { ui: "Monday", key: "mon" as const },
  { ui: "Tuesday", key: "tue" as const },
  { ui: "Wednesday", key: "wed" as const },
  { ui: "Thursday", key: "thu" as const },
  { ui: "Friday", key: "fri" as const },
  { ui: "Saturday", key: "sat" as const },
  { ui: "Sunday", key: "sun" as const },
];

type DayKey = (typeof DAY_META)[number]["key"];

type DayHour = { day: string; open: Date; close: Date; closed: boolean };

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
function fmtTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Default time creator
function mkTime(h: number, m: number) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// Convert "08:00" → Date (today)
function timeStrToDate(str?: string | null) {
  if (!str) return mkTime(9, 0);
  const [hStr, mStr] = str.split(":");
  const h = parseInt(hStr ?? "9", 10);
  const m = parseInt(mStr ?? "0", 10);
  return mkTime(isNaN(h) ? 9 : h, isNaN(m) ? 0 : m);
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hours, setHours] = useState<DayHour[]>([]);
  const [timezone, setTimezone] = useState("Asia/Bangkok");
  const [exceptions, setExceptions] = useState<any[]>([]);

  // Modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    index: number;
    field: "open" | "close";
  } | null>(null);

  // ---------- Load from backend ----------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!MERCHANT_ID) {
        setError("Missing merchant id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data: StoreSettings = await fetchStoreSettings(MERCHANT_ID);
        if (cancelled) return;

        const bh = data.businessHours as BusinessHours | undefined | null;

        if (bh && bh.weekly) {
          const weekly = bh.weekly as WeeklySchedule;

          const loadedHours: DayHour[] = DAY_META.map(({ ui, key }) => {
            const slots = weekly[key] ?? [];
            if (!slots || slots.length === 0) {
              return {
                day: ui,
                open: mkTime(9, 0),
                close: mkTime(18, 0),
                closed: true,
              };
            }
            const first = slots[0];
            return {
              day: ui,
              open: timeStrToDate(first.open),
              close: timeStrToDate(first.close),
              closed: false,
            };
          });

          setHours(loadedHours);
          setTimezone(bh.timezone || "Asia/Bangkok");
          setExceptions(Array.isArray(bh.exceptions) ? bh.exceptions : []);
        } else {
          // No business hours yet → seed default 15:00–19:00, Wednesday closed
          const seed: DayHour[] = DAY_META.map(({ ui }) => ({
            day: ui,
            open: mkTime(15, 0),
            close: mkTime(19, 0),
            closed: ui === "Wednesday",
          }));
          setHours(seed);
          setTimezone("Asia/Bangkok");
          setExceptions([]);
        }
      } catch (e: any) {
        if (cancelled) return;
        console.error("Failed to load business hours:", e);
        const msg = e?.message ?? "Failed to load business hours.";
        setError(msg);
        Alert.alert("Error", msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSave = useMemo(() => !saving && hours.length === DAY_META.length, [saving, hours.length]);

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
    if (!canSave || !MERCHANT_ID) return;

    setSaving(true);
    try {
      const weekly: WeeklySchedule = {};

      hours.forEach((item, idx) => {
        const key: DayKey = DAY_META[idx].key;
        if (item.closed) {
          weekly[key] = [];
        } else {
          weekly[key] = [
            {
              open: fmtTime(item.open),  // "08:00"
              close: fmtTime(item.close), // "18:00"
            },
          ];
        }
      });

      const payload: BusinessHours = {
        weekly,
        timezone: timezone || "Asia/Bangkok",
        exceptions,
      };

      await updateStoreSettings(MERCHANT_ID, {
        businessHours: payload,
      });

      Alert.alert("Success", "Business hours updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error("Save business hours failed:", e);
      Alert.alert("Save failed", e?.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const currentValue =
    pickerTarget && hours[pickerTarget.index]
      ? hours[pickerTarget.index][pickerTarget.field]
      : mkTime(9, 0);

  if (loading) {
    return (
      <ThemedView
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator />
        <Text className="mt-2 text-gray-500">Loading business hours…</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Header */}
      <View className="px-5 pb-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
        >
          <ChevronLeftIcon size={18} color="#11181C" />
        </Pressable>
        <Text className="text-2xl font-bold text-[#11181C]">
          Edit Business Hours
        </Text>
        <Pressable onPress={() => router.back()}>
          <XMarkIcon size={22} color="#11181C" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {error && (
          <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
            <Text className="text-red-600 text-[14px]">{error}</Text>
          </View>
        )}

        {hours.map((item, i) => (
          <View
            key={DAY_META[i].key}
            className="flex-row items-center justify-between py-3"
          >
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
                  <Text className="text-[16px] text-[#11181C]">
                    {fmtTime(item.open)}
                  </Text>
                </Pressable>
                <Text className="text-[#11181C] self-center">–</Text>
                <Pressable
                  onPress={() => openPicker(i, "close")}
                  className="min-w-[84px] border border-gray-300 rounded-xl px-3 py-2 items-center justify-center active:bg-gray-50"
                >
                  <Text className="text-[16px] text-[#11181C]">
                    {fmtTime(item.close)}
                  </Text>
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
          disabled={!canSave}
          className={`mt-8 w-full rounded-2xl py-4 items-center justify-center ${
            canSave ? "bg-[#26BD68]" : "bg-gray-300"
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
            ? `${hours[pickerTarget.index].day} — ${
                pickerTarget.field === "open" ? "Open" : "Close"
              } time`
            : "Select time"
        }
      />
    </ThemedView>
  );
}
