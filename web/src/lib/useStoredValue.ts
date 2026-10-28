"use client";

import { useSyncExternalStore } from "react";

const EVENT = "equiprent:storage";

type Area = "local" | "session";

function store(area: Area) {
  try {
    return area === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStored<T>(area: Area, key: string): T | null {
  try {
    const raw = store(area)?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeStored(area: Area, key: string, value: unknown) {
  try {
    store(area)?.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // private mode / storage full — feature bas kaam nahi karega, app nahi tootega
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Raw string snapshot (stable) — server pe undefined, client pe string | null.
// undefined = abhi pata nahi (hydration), null = kuch saved nahi
export function useStoredRaw(area: Area, key: string): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => store(area)?.getItem(key) ?? null,
    () => undefined,
  );
}
