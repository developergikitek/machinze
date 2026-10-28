"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import SuccessOverlay from "@/components/fx/SuccessOverlay";
import { PROFILE_KEY, saveSession, sendOtp, SESSION_KEY, verifyOtp } from "@/lib/auth";
import { haptic } from "@/lib/native";
import { readStored } from "@/lib/useStoredValue";
import { getAppLocation } from "@/lib/appLocation";
import { ROUTES } from "@/lib/routes";
import { SUCCESS_REDIRECT_MS, shakeFields } from "@/lib/shake";

import { FieldError } from "./Field";
import { ArrowRightIcon } from "./icons";
import OtpInput from "./OtpInput";
import PhoneField, { CountryCode, countryOf } from "./PhoneField";

const RESEND_SECONDS = 30;

type Step = "phone" | "otp";

export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [country, setCountry] = useState<CountryCode>("IN");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [success, setSuccess] = useState<{ title: string; subtitle: string }>();

  const fullPhone = `${countryOf(country).dial}${mobile}`;

  // Pehle se logged in? Login mat dikhao — app har baar /login (startPath) se khulta hai
  useEffect(() => {
    if (!readStored("local", SESSION_KEY)) return;
    router.replace(readStored("local", PROFILE_KEY) ? ROUTES.home : "/onboarding");
  }, [router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const requestOtp = async () => {
    setLoading(true);
    try {
      await sendOtp(fullPhone);
      setOtp("");
      setStep("otp");
      setResendIn(RESEND_SECONDS);
    } catch {
      setError("Couldn't send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitPhone = async (e: FormEvent) => {
    e.preventDefault();
    if (!countryOf(country).pattern.test(mobile)) {
      setError("Enter a valid mobile number");
      return shakeFields(["mobile"]);
    }
    setError(undefined);
    await requestOtp();
  };

  const submitOtp = async (code = otp) => {
    if (loading) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit OTP");
      return shakeFields(["otp"]);
    }
    setError(undefined);
    setLoading(true);
    try {
      const { isNewUser } = await verifyOtp(fullPhone, code);
      saveSession(fullPhone);
      haptic("success");
      setSuccess(
        isNewUser
          ? { title: "Verified!", subtitle: "Let's set up your profile" }
          : { title: "Welcome back!", subtitle: "Taking you to your dashboard…" },
      );
      const home = getAppLocation() ? ROUTES.home : ROUTES.location(ROUTES.home);
      setTimeout(() => router.push(isNewUser ? "/onboarding" : home), SUCCESS_REDIRECT_MS);
    } catch {
      setLoading(false);
      setError("Incorrect OTP. Please check and try again.");
      shakeFields(["otp"]);
    }
  };

  const primaryButton = (label: string) => (
    <button
      type="submit"
      disabled={loading}
      className="fx-shine group relative mt-1 flex h-[56px] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-950 text-[17px] font-semibold text-white shadow-[0_12px_24px_-10px_rgba(17,28,78,0.7)] transition active:scale-[0.98] disabled:opacity-80"
    >
      <span className="absolute inset-x-0 top-0 h-px bg-white/25" />
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <>
          {label}
          <ArrowRightIcon className="h-[18px] w-[18px] transition group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );

  return (
    <>
      {step === "phone" ? (
        <form key="phone" onSubmit={submitPhone} noValidate className="fx-stagger flex flex-col gap-5">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-navy-950">Welcome!</h1>
            <p className="mt-2 text-[15px] text-slate-500">Enter your mobile number to login or sign up</p>
          </div>

          <div className="mt-3">
            <PhoneField
              country={country}
              number={mobile}
              error={error}
              onCountryChange={(c) => {
                setCountry(c);
                setMobile((m) => m.slice(0, countryOf(c).maxLength));
                setError(undefined);
              }}
              onNumberChange={(v) => {
                setMobile(v);
                setError(undefined);
              }}
            />
          </div>

          {primaryButton("Get OTP")}

          <p className="text-center text-[13px] leading-relaxed text-slate-500">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="font-semibold text-navy-900">
              Terms
            </Link>{" "}
            &amp;{" "}
            <Link href="/privacy" className="font-semibold text-navy-900">
              Privacy Policy
            </Link>
          </p>
        </form>
      ) : (
        <form
          key="otp"
          onSubmit={(e) => {
            e.preventDefault();
            submitOtp();
          }}
          noValidate
          className="fx-stagger flex flex-col gap-5"
        >
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-navy-950">Verify OTP</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-navy-950">
                {countryOf(country).dial} {mobile}
              </span>{" "}
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setError(undefined);
                }}
                className="font-semibold text-navy-900 underline underline-offset-2"
              >
                Change
              </button>
            </p>
          </div>

          <div className="mt-3">
            <OtpInput
              value={otp}
              error={!!error}
              onChange={(v) => {
                setOtp(v);
                setError(undefined);
              }}
              onComplete={(v) => submitOtp(v)}
            />
            <FieldError error={error} />
          </div>

          {primaryButton("Verify & Continue")}

          <p className="text-center text-[14px] text-slate-500">
            Didn&apos;t receive the code?{" "}
            {resendIn > 0 ? (
              <span className="font-semibold tabular-nums text-slate-400">
                Resend in 0:{String(resendIn).padStart(2, "0")}
              </span>
            ) : (
              <button type="button" onClick={requestOtp} disabled={loading} className="font-semibold text-navy-900">
                Resend OTP
              </button>
            )}
          </p>
        </form>
      )}

      {success && <SuccessOverlay title={success.title} subtitle={success.subtitle} />}
    </>
  );
}
