"use client";

import { useSyncExternalStore } from "react";

import { postToNative } from "./native";
import { readStored, writeStored } from "./useStoredValue";

// Native app (mobile/App.tsx → locationScript) location bhejta hai — splash pe (permission pehle se ho to)
// ya /location page se. Shape mobile/src/location.ts ke AppLocation ke saath same rakhna.
export type AppLocation = {
  lat: number;
  lng: number;
  area: string;
  city: string;
};

// mobile/src/location.ts ke LocateStatus ke saath same rakhna
export type LocateStatus = "found" | "skipped" | "denied" | "blocked" | "off" | "failed";

declare global {
  interface Window {
    __APP_LOCATION__?: AppLocation;
  }
}

const STORAGE_KEY = "equiprent:location";
export const LOCATION_EVENT = "app-location";
export const LOCATE_STATUS_EVENT = "app-location-status";

// Browser me (app ke bahar) user ki chuni location reload ke baad bhi rahe.
// App me native baad me apni location inject karke ise override kar deta hai.
if (typeof window !== "undefined" && !window.__APP_LOCATION__) {
  window.__APP_LOCATION__ = readStored<AppLocation>("local", STORAGE_KEY) ?? undefined;
}

function subscribe(onChange: () => void) {
  window.addEventListener(LOCATION_EVENT, onChange);
  return () => window.removeEventListener(LOCATION_EVENT, onChange);
}

export function getAppLocation(): AppLocation | null {
  return typeof window === "undefined" ? null : (window.__APP_LOCATION__ ?? null);
}

export function useAppLocation(): AppLocation | null {
  return useSyncExternalStore(subscribe, getAppLocation, () => null);
}

// /location page pe chuni (search / saved site / browser GPS)
export function setAppLocation(location: AppLocation) {
  window.__APP_LOCATION__ = location;
  writeStored("local", STORAGE_KEY, location);
  window.dispatchEvent(new CustomEvent(LOCATION_EVENT, { detail: location }));
  postToNative({ type: "setLocation", location });
}
