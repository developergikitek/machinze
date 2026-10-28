import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { WEB_URL } from './config';

// Type web/src/lib/bookings.ts ke saath same rakhna
export type BookingStep = 'confirmed' | 'dispatched' | 'onsite';

export type ActiveBooking = {
  id: string;
  equipment: string;
  category: string;
  step: BookingStep;
  etaMinutes: number;
  operator: { name: string; phone: string };
};

// TODO: asli backend URL (logged-in user ki ongoing booking)
const ACTIVE_BOOKING_URL = `${WEB_URL}/api/active-booking`;
const CACHE_KEY = 'active-booking:v1';
const POLL_MS = 30_000;

// Chal rahi booking — cache se turant, phir app foreground me ho tab har 30s refresh
export function useActiveBooking() {
  const [booking, setBooking] = useState<ActiveBooking | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (raw && !cancelled) setBooking((current) => current ?? (JSON.parse(raw) as ActiveBooking));
      })
      .catch(() => {});

    const refresh = async () => {
      try {
        const res = await fetch(ACTIVE_BOOKING_URL);
        if (!res.ok) return;
        const next = ((await res.json()) as { booking: ActiveBooking | null }).booking ?? null;
        if (cancelled) return;
        setBooking(next);
        if (next) AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(() => {});
        else AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
      } catch {
        // network gaya — pichla state rehne do
      }
    };

    const start = () => {
      refresh();
      clearInterval(timer);
      timer = setInterval(refresh, POLL_MS);
    };

    start();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') start();
      else clearInterval(timer);
    });

    return () => {
      cancelled = true;
      clearInterval(timer);
      sub.remove();
    };
  }, []);

  return booking;
}
