import type { AppLocation } from "./appLocation";

// Web → native app messages. Types mobile/src/components/WebContent.tsx ke WebMessage ke saath same rakhna.
export type NativeMessage =
  | { type: "route"; path: string; title: string }
  // Header action (e.g. inbox) pe count badge
  | { type: "badge"; key: string; count: number }
  // "Use current location" — native permission maangta hai (zarurat ho to), phir GPS
  | { type: "locate" }
  // /location page pe search / saved site se chuni — native cache kare, header update kare
  | { type: "setLocation"; location: AppLocation }
  // Permission "Don't ask again" ho chuki — app settings kholo
  | { type: "openSettings" }
  // Native vibration (expo-haptics)
  | { type: "haptic"; style: HapticStyle };

export type HapticStyle = "selection" | "light" | "medium" | "success" | "warning" | "error";

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
  }
}

// Browser me (app ke bahar) kuch nahi karta
export function postToNative(message: NativeMessage) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}

export function haptic(style: HapticStyle) {
  postToNative({ type: "haptic", style });
}
