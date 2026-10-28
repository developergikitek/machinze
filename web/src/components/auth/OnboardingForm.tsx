"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import SuccessOverlay from "@/components/fx/SuccessOverlay";
import { getAppLocation } from "@/lib/appLocation";
import { Profile, saveProfile } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { SUCCESS_REDIRECT_MS, shakeFields } from "@/lib/shake";

import CustomerTypePicker, { CustomerType } from "./CustomerTypePicker";
import Field, { inputClass } from "./Field";
import { ArrowRightIcon, MailIcon, UserIcon } from "./icons";

type Errors = Partial<Record<"fullName" | "email", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Props = {
  // Profile edit ke liye pehle se bhari values; na ho to naya user (onboarding)
  initial?: Profile | null;
  submitLabel?: string;
  successTitle?: string;
  successSubtitle?: string;
  redirectTo?: string;
  // Onboarding: location na ho (splash pe permission nahi thi) to pehle /location page
  askLocation?: boolean;
};

export default function OnboardingForm({
  initial,
  submitLabel = "Get Started",
  successTitle = "You're all set!",
  successSubtitle = "Welcome to Machinze",
  redirectTo = ROUTES.home,
  askLocation = false,
}: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [customerType, setCustomerType] = useState<CustomerType>((initial?.customerType as CustomerType) ?? "individual");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (fullName.trim().length < 2) next.fullName = "Enter your full name";
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = "Enter a valid email or leave it blank";
    setErrors(next);
    if (Object.keys(next).length) return shakeFields(Object.keys(next));

    setLoading(true);
    await saveProfile({ fullName: fullName.trim(), email: email.trim() || undefined, customerType });
    setSuccess(true);
    const target = askLocation && !getAppLocation() ? ROUTES.location(redirectTo) : redirectTo;
    setTimeout(() => router.push(target), SUCCESS_REDIRECT_MS);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="fx-stagger flex flex-col gap-5">
      <Field label="Full Name" name="fullName" icon={<UserIcon />} error={errors.fullName}>
        <input
          className={inputClass}
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setErrors((er) => ({ ...er, fullName: undefined }));
          }}
        />
      </Field>

      <Field
        label={
          <>
            Email Address <span className="font-normal text-slate-400">(Optional)</span>
          </>
        }
        name="email"
        icon={<MailIcon />}
        error={errors.email}
      >
        <input
          className={inputClass}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Enter email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((er) => ({ ...er, email: undefined }));
          }}
        />
      </Field>

      <CustomerTypePicker value={customerType} onChange={setCustomerType} />

      <button
        type="submit"
        disabled={loading}
        className="fx-shine group relative mt-2 flex h-[56px] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-950 text-[17px] font-semibold text-white shadow-[0_12px_24px_-10px_rgba(17,28,78,0.7)] transition active:scale-[0.98] disabled:opacity-80"
      >
        <span className="absolute inset-x-0 top-0 h-px bg-white/25" />
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            {submitLabel}
            <ArrowRightIcon className="h-[18px] w-[18px] transition group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      {success && <SuccessOverlay title={successTitle} subtitle={successSubtitle} />}
    </form>
  );
}
