// utils/businessHours.ts
import type { BusinessHours } from "@/app/(pages)/edit-business-hours";

// Same DayKey concept as your EditBusinessHours screen
type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

type DaySlot = { open: string; close: string };

function timeStrToMinutes(t: string): number {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = parseInt(mStr ?? "0", 10);
  return h * 60 + m;
}

/**
 * Determine if the store is open at a given local time, based on BusinessHours.
 *
 * RULE:
 * - If close > open → normal same-day slot
 *   - open <= now < close
 * - If close <= open → OVERNIGHT slot (e.g. 11:00 → 05:00 next day)
 *   - For the *start day*:
 *       now >= open  OR  now < close (after midnight)
 *   - For the *next day*:
 *       only the portion after midnight is relevant (now < close)
 */
export function isStoreOpenAt(
  bh: BusinessHours | null | undefined,
  at: Date
): boolean {
  if (!bh || !bh.weekly) return false;

  const weekly = bh.weekly as Record<DayKey, DaySlot[] | undefined>;

  const dayIndex = at.getDay(); // 0 = Sunday ... 6 = Saturday
  const todayKey = DAY_KEYS[dayIndex];
  const yesterdayKey = DAY_KEYS[(dayIndex + 6) % 7]; // previous day

  const nowMins = at.getHours() * 60 + at.getMinutes();

  // 1) Check today's own slots
  const todaySlots = weekly[todayKey] ?? [];
  for (const slot of todaySlots) {
    const openMins = timeStrToMinutes(slot.open);
    const closeMins = timeStrToMinutes(slot.close);

    if (closeMins > openMins) {
      // normal same-day, e.g. 09:00 → 17:00
      if (nowMins >= openMins && nowMins < closeMins) {
        return true;
      }
    } else {
      // overnight starting *today*, e.g. 20:00 → 03:00 next day
      // open today, runs past midnight
      if (nowMins >= openMins || nowMins < closeMins) {
        return true;
      }
    }
  }

  // 2) Check yesterday's overnight slots
  const yesterdaySlots = weekly[yesterdayKey] ?? [];
  for (const slot of yesterdaySlots) {
    const openMins = timeStrToMinutes(slot.open);
    const closeMins = timeStrToMinutes(slot.close);

    if (closeMins <= openMins) {
      // overnight from yesterday into today
      // The part we care about today is: 00:00 → closeMins
      if (nowMins < closeMins) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Simple helper: given BusinessHours, return a human-readable "Open now" / "Closed".
 */
export function getOpenStatusLabel(
  bh: BusinessHours | null | undefined,
  at: Date = new Date()
): "OPEN" | "CLOSED" {
  return isStoreOpenAt(bh, at) ? "OPEN" : "CLOSED";
}
