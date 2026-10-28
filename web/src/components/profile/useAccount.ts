"use client";

import { useMemo } from "react";

import { ADDRESSES_KEY, DeliveryAddress } from "@/lib/addresses";
import { PROFILE_KEY, Profile, Session, SESSION_KEY } from "@/lib/auth";
import { KYC_KEY, KycRecord } from "@/lib/kyc";
import { useStoredRaw } from "@/lib/useStoredValue";

function parse<T>(raw: string | null | undefined): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// Profile + session + KYC + saved sites. ready=false jab tak storage nahi padha (hydration)
export function useAccount() {
  const profileRaw = useStoredRaw("local", PROFILE_KEY);
  const sessionRaw = useStoredRaw("local", SESSION_KEY);
  const kycRaw = useStoredRaw("local", KYC_KEY);
  const addressesRaw = useStoredRaw("local", ADDRESSES_KEY);

  return useMemo(
    () => ({
      ready: profileRaw !== undefined,
      profile: parse<Profile>(profileRaw),
      session: parse<Session>(sessionRaw),
      kyc: parse<KycRecord>(kycRaw),
      addresses: parse<DeliveryAddress[]>(addressesRaw) ?? [],
    }),
    [profileRaw, sessionRaw, kycRaw, addressesRaw],
  );
}
