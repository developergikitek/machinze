"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const t = setInterval(onChange, MINUTE);
  return () => clearInterval(t);
}

// Abhi ka samay, minute tak — har minute update. Server pe null (hydration safe)
export function useNowMinute(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / MINUTE) * MINUTE,
    () => null,
  );
}
