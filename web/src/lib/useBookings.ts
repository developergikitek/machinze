"use client";

import { useEffect, useMemo } from "react";

import { BOOKINGS_KEY, ConfirmedBooking, DEMO_SEEDED_KEY, demoBookings } from "./bookingsStore";
import { toISODate } from "./dates";
import { useNowMinute } from "./useNow";
import { readStored, useStoredRaw, writeStored } from "./useStoredValue";

// Saari bookings (naya pehle) + aaj ki tareekh. undefined = abhi load ho raha (hydration)
export function useBookings() {
  const raw = useStoredRaw("local", BOOKINGS_KEY);
  const now = useNowMinute();

  // TODO: API aane pe hatao — pehli baar demo bookings daalo
  useEffect(() => {
    if (raw === undefined || readStored<boolean>("local", DEMO_SEEDED_KEY)) return;
    const existing = readStored<ConfirmedBooking[]>("local", BOOKINGS_KEY) ?? [];
    writeStored("local", BOOKINGS_KEY, [...existing, ...demoBookings(new Date())]);
    writeStored("local", DEMO_SEEDED_KEY, true);
  }, [raw]);

  const bookings = useMemo(() => {
    if (raw === undefined) return undefined;
    try {
      return ((raw ? JSON.parse(raw) : []) as ConfirmedBooking[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch {
      return [];
    }
  }, [raw]);

  return { bookings, now, todayISO: now === null ? null : toISODate(new Date(now)) };
}

export function updateBooking(id: string, patch: Partial<ConfirmedBooking>) {
  const list = readStored<ConfirmedBooking[]>("local", BOOKINGS_KEY) ?? [];
  writeStored(
    "local",
    BOOKINGS_KEY,
    list.map((b) => (b.id === id ? { ...b, ...patch } : b)),
  );
}
