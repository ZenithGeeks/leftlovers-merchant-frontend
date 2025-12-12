// app/(pages)/edit-business-hours.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/store";

import BusinessHoursForm, {
  type DayHour,
} from "@/components/store/BusinessHoursForm";
import StoreHeader from "@/components/store/StoreHeader";
import TimePickerModal from "@/components/store/TimePickerModal";

type DaySlot = { open: string; close: string };

export type WeeklySchedule = {
  mon?: DaySlot[];
  tue?: DaySlot[];
  wed?: DaySlot[];
  thu?: DaySlot[];
  fri?: DaySlot[];
  sat?: DaySlot[];
  sun?: DaySlot[];
};

export type BusinessHours = {
  weekly: WeeklySchedule;
  timezone?: string | null;
  exceptions?: any[];
};

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

// utils
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

type EditBusinessHoursParams = { merchantId?: string };

export default function EditBusinessHours() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<EditBusinessHoursParams>();
  const merchantId = params.merchantId ?? "";

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
      if (!merchantId) {
        setError("Missing merchant id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data: StoreSettings = await fetchStoreSettings(merchantId);
        if (cancelled) return;

        const bh = data.businessHours as BusinessHours | undefined | null;

        if (bh && bh.weekly) {
          const weekly = bh.weekly as WeeklySchedule;

          const loadedHours: DayHour[] = DAY_META.map(({ ui, key }) => {
            const slots = (weekly[key] ?? []) as DaySlot[];
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
  }, [merchantId]);

  const canSave = useMemo(
    () => !!merchantId && !saving && hours.length === DAY_META.length,
    [merchantId, saving, hours.length]
  );

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

  const setClosedState = (index: number, closed: boolean) => {
    setHours((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], closed };
      return next;
    });
  };

  const onSave = async () => {
    if (!canSave || !merchantId) return;

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
              open: fmtTime(item.open), 
              close: fmtTime(item.close), 
            },
          ];
        }
      });

      const payload: BusinessHours = {
        weekly,
        timezone: timezone || "Asia/Bangkok",
        exceptions,
      };

      await updateStoreSettings(merchantId, {
        businessHours: payload as any,
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

  if (!merchantId) {
    return (
      <ThemedView
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-red-600 mb-2 font-semibold">
          Missing merchant id
        </Text>
        <Text className="text-gray-500 text-center px-6">
          This screen must be opened with a merchantId param.
        </Text>
      </ThemedView>
    );
  }

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
      <StoreHeader
        title="Edit Business Hours"
        onBack={() => router.back()}
      />

      {/* Form */}
      <BusinessHoursForm
        hours={hours}
        error={error}
        canSave={canSave}
        saving={saving}
        onSave={onSave}
        openPicker={openPicker}
        setClosedState={setClosedState}
        bottomPadding={insets.bottom}
        fmtTime={fmtTime}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={pickerOpen}
        value={currentValue}
        onChange={setTime}
        onClose={closePicker}
        title={
          pickerTarget
            ? `${hours[pickerTarget.index].day} - ${
                pickerTarget.field === "open" ? "Open" : "Close"
              } time`
            : "Select time"
        }
      />
    </ThemedView>
  );
}
