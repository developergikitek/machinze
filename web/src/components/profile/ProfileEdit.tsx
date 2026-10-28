"use client";

import OnboardingForm from "@/components/auth/OnboardingForm";
import { ROUTES } from "@/lib/routes";

import { useAccount } from "./useAccount";

// Saved profile padh ke hi form dikhao — warna pehle khaali form render ho jaata
export default function ProfileEdit() {
  const { ready, profile } = useAccount();
  if (!ready) return <div className="h-[360px] animate-pulse rounded-2xl bg-white" />;
  return (
    <OnboardingForm
      initial={profile}
      submitLabel="Save changes"
      successTitle="Profile updated"
      successSubtitle="Your details are saved"
      redirectTo={ROUTES.profile}
    />
  );
}
