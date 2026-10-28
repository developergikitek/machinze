"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { jakarta } from "@/app/fonts";
import Logo from "@/components/auth/Logo";
import Aurora from "@/components/fx/Aurora";

const MIN_VISIBLE_MS = 1800;
const HOLD_MS = 1500;
const LOCATE_TIMEOUT_MS = 8000;
const NEXT_PATH = "/login";

type Result = "found" | "denied" | "unavailable";

const FALLBACK_TEXT: Record<Exclude<Result, "found">, string> = {
  denied: "Location permission denied",
  unavailable: "Couldn't get your location",
};

function locate(): Promise<Result> {
  // Geolocation sirf https / localhost pe chalti hai
  if (!window.isSecureContext || !("geolocation" in navigator)) return Promise.resolve("unavailable");
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        // TODO: reverse geocode (Google Maps / Mapbox key) se area ka naam
        window.__APP_LOCATION__ = { lat: coords.latitude, lng: coords.longitude, area: "Current location", city: "" };
        window.dispatchEvent(new CustomEvent("app-location", { detail: window.__APP_LOCATION__ }));
        resolve("found");
      },
      (err) => resolve(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      { timeout: LOCATE_TIMEOUT_MS, maximumAge: 5 * 60 * 1000 },
    );
  });
}

function MapBackdrop() {
  return (
    <svg
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <g stroke="#111c4e" strokeOpacity="0.06" fill="none" strokeLinecap="round">
        <path d="M-20 186C117 152 234 270 410 219" strokeWidth="14" />
        <path d="M70-20C101 253 31 464 86 864" strokeWidth="10" />
        <path d="M-20 523C137 490 273 591 410 540" strokeWidth="10" />
        <path d="M304-20C273 295 359 506 312 864" strokeWidth="8" />
        <path d="M176 203L203 557" strokeWidth="5" />
        <path d="M78 371L312 354" strokeWidth="5" />
      </g>
      <g fill="#111c4e" fillOpacity="0.035">
        <rect x="105" y="253" width="55" height="76" rx="8" />
        <rect x="226" y="262" width="58" height="68" rx="8" />
        <rect x="109" y="397" width="62" height="84" rx="8" />
        <rect x="222" y="397" width="55" height="93" rx="8" />
      </g>
      <g fill="#111c4e" fillOpacity="0.07">
        <rect x="16" y="694" width="34" height="150" />
        <rect x="56" y="734" width="28" height="110" />
        <rect x="125" y="754" width="40" height="90" />
        <rect x="215" y="714" width="30" height="130" />
        <rect x="251" y="764" width="44" height="80" />
        <rect x="335" y="684" width="36" height="160" />
      </g>
      <g stroke="#111c4e" strokeOpacity="0.12" strokeWidth="1.4" fill="none">
        <path d="M86 844V614M94 844V614M31 618H195M31 626H195M90 618V598L31 618M90 598L195 618M172 626V664" />
      </g>
    </svg>
  );
}

function Pin() {
  return (
    <svg width="64" height="78" viewBox="0 0 48 58" aria-hidden>
      <defs>
        <linearGradient id="splash-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc445" />
          <stop offset="1" stopColor="#ec960c" />
        </linearGradient>
      </defs>
      <path d="M24 2C13.5 2 5 10.2 5 20.6 5 34 24 54 24 54S43 34 43 20.6C43 10.2 34.5 2 24 2Z" fill="url(#splash-pin)" />
      <path d="M24 2C13.5 2 5 10.2 5 20.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="20.5" r="9.5" fill="#fff" />
      <circle cx="24" cy="20.5" r="4.5" fill="#111c4e" />
    </svg>
  );
}

// Browser me root (/) ka splash — native app ke AppSplash jaisa. App ke andar ye skip hota hai
// (native splash pehle hi dikh chuka), seedha /login.
export default function WebSplash() {
  const router = useRouter();
  const [result, setResult] = useState<Result>();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (window.ReactNativeWebView) {
      router.replace(NEXT_PATH);
      return;
    }
    router.prefetch(NEXT_PATH);

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const started = Date.now();
    locate().then((res) => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - started));
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setResult(res);
          timers.push(setTimeout(() => setLeaving(true), HOLD_MS));
          timers.push(setTimeout(() => router.replace(NEXT_PATH), HOLD_MS + 380));
        }, wait),
      );
    });
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [router]);

  return (
    <main
      className={`${jakarta.className} relative flex min-h-dvh flex-col items-center overflow-hidden bg-gradient-to-b from-[#fff8ec] via-[#fff3dc] to-white transition duration-[380ms] ease-in ${
        leaving ? "scale-[1.04] opacity-0" : "opacity-100"
      }`}
    >
      <Aurora sparkles={false} />
      <MapBackdrop />

      <div className="relative mt-[20vh] animate-rise motion-reduce:animate-none">
        <Logo tagline="Rent. Build. Succeed." />
      </div>

      <div className="relative mt-[13vh] flex flex-col items-center">
        <div className="relative flex h-[110px] w-[200px] items-end justify-center">
          {!result && (
            <div className="fx-radar absolute inset-0" aria-hidden>
              <span />
              <span />
              <span />
            </div>
          )}
          <span
            className={`absolute -bottom-1.5 h-2.5 w-[34px] rounded-full bg-navy-900/20 ${result ? "" : "fx-pin-shadow"}`}
          />
          <div className={`relative -mb-0.5 ${result ? "fx-pop" : "fx-pin-hop"}`}>
            <Pin />
          </div>
        </div>

        {!result ? (
          <p className="mt-9 text-[15px] font-semibold text-slate-600">Finding your location…</p>
        ) : (
          <div className="mt-7 min-w-[240px] animate-rise rounded-[18px] border border-[#f1e2c4] bg-white/85 px-6 py-3.5 text-center shadow-[0_8px_18px_-6px_rgba(184,134,11,0.25)] motion-reduce:animate-none">
            {result === "found" ? (
              <>
                <p className="text-[11px] font-bold tracking-[0.12em] text-[#c77d06]">DELIVERING EQUIPMENT TO</p>
                <p className="mt-1 text-[20px] font-extrabold text-navy-950">Your current location</p>
              </>
            ) : (
              <>
                <p className="text-[18px] font-extrabold text-navy-950">{FALLBACK_TEXT[result]}</p>
                <p className="mt-0.5 text-[13px] text-slate-500">You can set your location later</p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
