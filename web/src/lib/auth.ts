// TODO: asli backend lagao. Abhi demo ke liye fake delay + koi bhi 6-digit OTP chalta hai.

import { readStored, writeStored } from "./useStoredValue";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendOtp(phone: string): Promise<void> {
  void phone;
  await delay(800);
}

export async function verifyOtp(phone: string, otp: string): Promise<{ isNewUser: boolean }> {
  void phone;
  await delay(900);
  if (!/^\d{6}$/.test(otp)) throw new Error("Invalid OTP");
  // Naya user → /onboarding (profile complete), purana → seedha home
  return { isNewUser: true };
}

export type Profile = {
  fullName: string;
  email?: string;
  customerType: string;
};

export const PROFILE_KEY = "equiprent:profile";
// Login session (demo) — verified phone number
export const SESSION_KEY = "equiprent:session";

export type Session = { phone: string };

export async function saveProfile(profile: Profile): Promise<void> {
  await delay(900);
  // Demo: backend ki jagah device pe
  writeStored("local", PROFILE_KEY, profile);
}

export function getSavedProfile(): Profile | null {
  return readStored<Profile>("local", PROFILE_KEY);
}

export function saveSession(phone: string) {
  writeStored("local", SESSION_KEY, { phone } satisfies Session);
}

// TODO: server session / token bhi invalidate karo
export function logout() {
  writeStored("local", SESSION_KEY, null);
  writeStored("local", PROFILE_KEY, null);
}
