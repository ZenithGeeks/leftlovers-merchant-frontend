import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import StoreHeader from "@/components/store/StoreHeader";
import BusinessHoursForm, {
  type DayHour,
} from "@/components/store/BusinessHoursForm";
import TimePickerModal from "@/components/store/TimePickerModal";

import {
  fetchStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/store";

// Match what we expect from backend for businessHours
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

type EditBusinessHoursParams = { merchantId?: string };

// ---- helpers for times ----
function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
function fmtTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

// minutes from Date (0..1439)
function dateToMinutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

// ==== VALIDATION: prevent illogical overlaps (like Mon 08:00–05:00, Tue 04:00–18:00) ====

type Interval = { start: number; end: number };

function validateBusinessHours(hours: DayHour[]): string | null {
  if (hours.length !== DAY_META.length) return null; // defensive

  const intervals: Interval[] = [];

  for (let i = 0; i < hours.length; i++) {
    const h = hours[i];
    if (h.closed) continue;

    const openMins = dateToMinutes(h.open);
    const closeMins = dateToMinutes(h.close);

    if (openMins === closeMins) {
      return `${h.day}: open and close time must be different.`;
    }

    if (
      openMins < 0 ||
      openMins >= 24 * 60 ||
      closeMins < 0 ||
      closeMins >= 24 * 60
    ) {
      return `${h.day}: time must be within 00:00–23:59.`;
    }

    const dayBase = i * 24 * 60;

    if (closeMins > openMins) {
      // normal same-day slot
      intervals.push({
        start: dayBase + openMins,
        end: dayBase + closeMins,
      });
    } else {
      // OVERNIGHT: e.g. 11:00 → 05:00 (next day)
      // Part 1: same day open → midnight
      intervals.push({
        start: dayBase + openMins,
        end: dayBase + 24 * 60,
      });
      // Part 2: next day midnight → close
      const nextDayBase = (i + 1) * 24 * 60;
      intervals.push({
        start: nextDayBase,
        end: nextDayBase + closeMins,
      });
    }
  }

  // sort intervals by start time
  intervals.sort((a, b) => a.start - b.start);

  // detect overlaps
  for (let i = 1; i < intervals.length; i++) {
    const prev = intervals[i - 1];
    const curr = intervals[i];

    if (curr.start < prev.end) {
      // overlap = illogical schedule
      return (
        "Your opening hours overlap across days (for example, late-night hours " +
        "from one day collide with early-morning hours on the next). " +
        "Please adjust times so they don't overlap."
      );
    }
  }

  return null;
}

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
    () => !saving && hours.length === DAY_META.length,
    [saving, hours.length]
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

    // ✅ validate BEFORE sending to backend (catch SukiTeenoi-overlap bugs)
    const validationError = validateBusinessHours(hours);
    if (validationError) {
      Alert.alert("Invalid hours", validationError);
      return;
    }

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
              open: fmtTime(item.open), // "08:00"
              close: fmtTime(item.close), // "18:00" or overnight "05:00"
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

  if (!merchantId) {
    return (
      <ThemedView
        className="flex-1 bg-white items-center justify-center px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-red-600 mb-2 font-semibold">
          Missing merchant id
        </Text>
        <Text className="text-gray-500 text-center">
          This screen must be opened with a merchantId param.
        </Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Header */}
      <StoreHeader title="Edit Business Hours" onBack={() => router.back()} />

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
