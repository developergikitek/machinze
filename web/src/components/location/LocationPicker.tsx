"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ADDRESSES_KEY, addressTitle, DeliveryAddress } from "@/lib/addresses";
import { AppLocation, LOCATE_STATUS_EVENT, LocateStatus, setAppLocation, useAppLocation } from "@/lib/appLocation";
import { haptic, postToNative } from "@/lib/native";
import { Place, reversePlace, searchPlaces } from "@/lib/places";
import { ROUTES } from "@/lib/routes";
import { useStoredRaw } from "@/lib/useStoredValue";

const SEARCH_DEBOUNCE_MS = 350;
// Native se jawab na aaye (GPS atka) to spinner hatao
const LOCATE_TIMEOUT_MS = 15_000;

type Problem = Exclude<LocateStatus, "found" | "skipped">;

const PROBLEM_TEXT: Record<Problem, { title: string; body: string }> = {
  denied: { title: "Location permission denied", body: "Allow location to find equipment near your site, or search below." },
  blocked: { title: "Location permission is off", body: "Turn it on from app settings, or search for your area below." },
  off: { title: "Device location is off", body: "Turn on location (GPS), or search for your area below." },
  failed: { title: "Couldn't get your location", body: "Please try again, or search for your area below." },
};

// Sirf next=/... (open redirect nahi)
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function Row({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3.5 text-left last:border-b-0 active:bg-slate-50">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold text-navy-950">{title}</span>
        {subtitle && <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{subtitle}</span>}
      </span>
    </button>
  );
}

// Swiggy jaisa: upar search, "Use my current location", saved sites, results.
// Permission sirf "current location" tap pe maangte hain (splash pe nahi).
export default function LocationPicker() {
  const router = useRouter();
  const params = useSearchParams();
  // next ho = onboarding ke baad pehli baar (back nahi, bada heading)
  const next = safeNext(params.get("next"));
  const current = useAppLocation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [problem, setProblem] = useState<Problem>();

  const savedRaw = useStoredRaw("local", ADDRESSES_KEY);
  const saved = useMemo(() => {
    try {
      const list = savedRaw ? (JSON.parse(savedRaw) as DeliveryAddress[]) : [];
      return list.filter((a) => a.lat != null && a.lng != null);
    } catch {
      return [];
    }
  }, [savedRaw]);

  const done = () => {
    haptic("success");
    if (next) router.replace(next);
    else if (window.history.length > 1) router.back();
    else router.replace(ROUTES.home);
  };

  const choose = (location: AppLocation) => {
    setAppLocation(location);
    done();
  };

  // Native "Use current location" ka nateeja
  useEffect(() => {
    const onStatus = (e: Event) => {
      const { status } = (e as CustomEvent<{ status: LocateStatus }>).detail;
      setLocating(false);
      // found pe location native ne already inject kar di (app-location event)
      if (status === "found") done();
      else if (status !== "skipped") setProblem(status);
    };
    window.addEventListener(LOCATE_STATUS_EVENT, onStatus);
    return () => window.removeEventListener(LOCATE_STATUS_EVENT, onStatus);
  });

  useEffect(() => {
    if (!locating) return;
    const t = setTimeout(() => {
      setLocating(false);
      setProblem("failed");
    }, LOCATE_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [locating]);

  // Settings se permission on karke wapas aaye → dobara try
  useEffect(() => {
    if (problem !== "blocked" && problem !== "off") return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      setProblem(undefined);
      setLocating(true);
      postToNative({ type: "locate" });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [problem]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchPlaces(q, current, controller.signal));
        setSearchError(false);
      } catch {
        if (!controller.signal.aborted) setSearchError(true);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
    // current sirf bias ke liye — badalne pe dobara search nahi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const useCurrent = () => {
    setProblem(undefined);
    if (problem === "blocked") {
      postToNative({ type: "openSettings" });
      return;
    }
    if (window.ReactNativeWebView) {
      setLocating(true);
      postToNative({ type: "locate" });
      return;
    }
    // Browser (app ke bahar)
    if (!window.isSecureContext || !("geolocation" in navigator)) {
      setProblem("failed");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const location = await reversePlace(coords.latitude, coords.longitude);
        setLocating(false);
        choose(location);
      },
      (err) => {
        setLocating(false);
        setProblem(err.code === err.PERMISSION_DENIED ? "denied" : "failed");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const showResults = query.trim().length >= 2;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-30 bg-white px-4 pb-3 pt-3 shadow-[0_6px_12px_-12px_rgba(17,28,78,0.4)]">
        {next ? (
          <div className="pb-4 pt-6">
            <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-navy-950">Where&apos;s your site?</h1>
            <p className="mt-1 text-[14px] text-slate-500">We&apos;ll show equipment available near you.</p>
          </div>
        ) : (
          <div className="flex h-12 items-center gap-2">
            <button
              type="button"
              aria-label="Back"
              onClick={done}
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-navy-950 active:scale-90"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            <h1 className="text-[17px] font-bold text-navy-950">Select your location</h1>
          </div>
        )}

        <label className="flex h-12 items-center gap-2.5 rounded-xl border border-slate-200 bg-[#f7f8fa] px-3.5 focus-within:border-navy-800 focus-within:bg-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-slate-400" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Search for area, street or site name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="autofill-reset min-w-0 flex-1 bg-transparent text-[15px] text-navy-950 outline-none placeholder:text-slate-400"
          />
          {searching && <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-navy-800" />}
          {!!query && !searching && (
            <button type="button" aria-label="Clear" onClick={() => setQuery("")} className="shrink-0 text-[13px] font-semibold text-amber-600">
              Clear
            </button>
          )}
        </label>
      </div>

      <div className="flex-1 space-y-4 bg-[#f5f6f8] px-4 pb-10 pt-4">
        <div className="overflow-hidden rounded-2xl bg-white">
          <button
            type="button"
            onClick={useCurrent}
            disabled={locating}
            className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-slate-50 disabled:opacity-80"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              {locating ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <circle cx="12" cy="12" r="3.5" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <circle cx="12" cy="12" r="7.5" />
                </svg>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-amber-600">
                {locating ? "Getting your location…" : problem === "blocked" ? "Open settings to allow location" : "Use my current location"}
              </span>
              <span className="block text-[12px] text-slate-500">Using GPS</span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-slate-300" aria-hidden>
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>

          {problem && (
            <div className="border-t border-slate-100 bg-red-50/60 px-4 py-3">
              <p className="text-[13px] font-semibold text-red-700">{PROBLEM_TEXT[problem].title}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-red-600/90">{PROBLEM_TEXT[problem].body}</p>
            </div>
          )}
        </div>

        {showResults ? (
          <section>
            <h3 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-slate-500">Search results</h3>
            <div className="overflow-hidden rounded-2xl bg-white">
              {results.map((p) => (
                <Row key={p.id} icon={<PinIcon />} title={p.title} subtitle={p.subtitle} onClick={() => choose(p)} />
              ))}
              {!results.length && !searching && (
                <p className="px-4 py-6 text-center text-[13px] text-slate-500">
                  {searchError ? "Search isn't working right now. Please try again." : "No places found. Try a nearby area or landmark."}
                </p>
              )}
              {!results.length && searching && <div className="h-[140px] animate-pulse bg-white" />}
            </div>
          </section>
        ) : (
          saved.length > 0 && (
            <section>
              <h3 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-slate-500">Saved sites</h3>
              <div className="overflow-hidden rounded-2xl bg-white">
                {saved.map((a) => (
                  <Row
                    key={a.id}
                    icon={<PinIcon />}
                    title={addressTitle(a)}
                    subtitle={a.address}
                    onClick={() => choose({ lat: a.lat!, lng: a.lng!, area: addressTitle(a), city: a.address })}
                  />
                ))}
              </div>
            </section>
          )
        )}
      </div>
    </div>
  );
}
