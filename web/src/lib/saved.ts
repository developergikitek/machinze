"use client";

import { useMemo } from "react";

import type { Equipment } from "./equipment";
import { haptic } from "./native";
import { readStored, useStoredRaw, writeStored } from "./useStoredValue";

// ❤️ wali machines — demo me device pe (localStorage). TODO: user wishlist API
export type SavedItem = {
  id: string;
  // ISO timestamp
  savedAt: string;
  // Save karte waqt ka rate — baad me sasta hua to "↓ ₹200" dikhate hain
  pricePerHour: number;
  pricePerDay: number;
};

export const SAVED_KEY = "equiprent:saved";

function read() {
  return readStored<SavedItem[]>("local", SAVED_KEY) ?? [];
}

export function saveItem(item: Equipment) {
  const rest = read().filter((s) => s.id !== item.id);
  writeStored("local", SAVED_KEY, [
    { id: item.id, savedAt: new Date().toISOString(), pricePerHour: item.pricePerHour, pricePerDay: item.pricePerDay },
    ...rest,
  ]);
}

export function unsaveItem(id: string) {
  writeStored(
    "local",
    SAVED_KEY,
    read().filter((s) => s.id !== id),
  );
}

// Undo ke liye — hataya hua item wapas usi jagah
export function restoreItem(saved: SavedItem, index: number) {
  const list = read().filter((s) => s.id !== saved.id);
  list.splice(index, 0, saved);
  writeStored("local", SAVED_KEY, list);
}

// undefined = abhi pata nahi (hydration)
export function useSaved(): SavedItem[] | undefined {
  const raw = useStoredRaw("local", SAVED_KEY);
  return useMemo(() => {
    if (raw === undefined) return undefined;
    try {
      return raw ? (JSON.parse(raw) as SavedItem[]) : [];
    } catch {
      return [];
    }
  }, [raw]);
}

export function useIsSaved(item: Equipment) {
  const saved = useSaved();
  const isSaved = !!saved?.some((s) => s.id === item.id);
  const toggle = () => {
    haptic("light");
    if (isSaved) unsaveItem(item.id);
    else saveItem(item);
  };
  return [isSaved, toggle] as const;
}
