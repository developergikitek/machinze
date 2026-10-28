"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useMemo, useState } from "react";

import { Group } from "@/components/equipment/Group";
import { ADDRESSES_KEY, addressTitle, DeliveryAddress, MAX_SAVED_ADDRESSES } from "@/lib/addresses";
import { useAppLocation } from "@/lib/appLocation";
import { getSavedProfile } from "@/lib/auth";
import { BookingDraft, draftKey } from "@/lib/bookingDraft";
import { Equipment, formatINR } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";
import { shakeFields } from "@/lib/shake";
import { readStored, useStoredRaw, writeStored } from "@/lib/useStoredValue";

import { formatDay, fromISODate } from "@/lib/dates";
import EquipmentSummary from "./EquipmentSummary";

const PINCODE_RE = /^[1-9]\d{5}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

type Field = "address" | "pincode" | "contactName" | "contactPhone";
type Errors = Partial<Record<Field, string>>;

const inputClass =
  "autofill-reset w-full bg-transparent text-[15px] text-navy-950 outline-none placeholder:text-slate-400";

function FieldRow({ label, name, error, children }: { label: string; name?: Field; error?: string; children: ReactNode }) {
  return (
    <label data-field={name} className="block border-b border-slate-100 px-4 py-2.5 last:border-b-0 focus-within:bg-[#fafbfc]">
      <span className={`block text-[12px] font-medium ${error ? "text-red-500" : "text-slate-500"}`}>{error ?? label}</span>
      <span className="mt-0.5 block">{children}</span>
    </label>
  );
}

function parse<T>(raw: string | null | undefined): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export default function DeliveryForm({ item }: { item: Equipment }) {
  const router = useRouter();
  const draftRaw = useStoredRaw("session", draftKey(item.id));
  const savedRaw = useStoredRaw("local", ADDRESSES_KEY);
  const draft = useMemo(() => parse<BookingDraft>(draftRaw), [draftRaw]);
  const saved = useMemo(() => parse<DeliveryAddress[]>(savedRaw) ?? [], [savedRaw]);
  const location = useAppLocation();

  // null = user ne abhi kuch nahi chuna → pehla saved site (agar ho), warna naya
  const [choice, setChoice] = useState<string | null>(null);
  const selected = choice ?? saved[0]?.id ?? "new";
  const [site, setSite] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [contactName, setContactName] = useState(() => (typeof window === "undefined" ? "" : getSavedProfile()?.fullName ?? ""));
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState(() => readStored<BookingDraft>("session", draftKey(item.id))?.notes ?? "");
  const [save, setSave] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>();
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string>();
  const [errors, setErrors] = useState<Errors>({});

  const clear = (f: Field) => setErrors((e) => (e[f] ? { ...e, [f]: undefined } : e));

  const useCurrent = () => {
    setLocateError(undefined);
    if (location) {
      setAddress([location.area, location.city].filter(Boolean).join(", "));
      setCoords({ lat: location.lat, lng: location.lng });
      clear("address");
      return;
    }
    if (!window.isSecureContext || !("geolocation" in navigator)) {
      setLocateError("Location isn't available here. Please type the address.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setLocating(false);
        setCoords({ lat: c.latitude, lng: c.longitude });
      },
      () => {
        setLocating(false);
        setLocateError("Couldn't get your location. Please type the address.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (draftRaw === undefined) return <div className="m-4 h-[480px] animate-pulse rounded-2xl bg-white" />;

  if (!draft) {
    return (
      <div className="m-4 rounded-2xl bg-white p-6 text-center">
        <p className="text-[16px] font-semibold text-navy-950">Pick your dates first</p>
        <p className="mt-1 text-[13px] text-slate-500">Your booking details weren&apos;t found.</p>
        <Link href={ROUTES.book(item.id)} className="mt-4 inline-flex h-10 items-center rounded-xl bg-navy-950 px-5 text-[14px] font-semibold text-white">
          Select dates
        </Link>
      </div>
    );
  }

  const start = fromISODate(draft.startDate);
  const end = fromISODate(draft.endDate);
  const when = draft.startDate === draft.endDate ? formatDay(start) : `${formatDay(start)} – ${formatDay(end)}`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (selected === "new") {
      if (address.trim().length < 8) next.address = "Enter the complete site address";
      if (!PINCODE_RE.test(pincode)) next.pincode = "Enter a valid 6-digit pincode";
      if (contactName.trim().length < 2) next.contactName = "Enter the site contact's name";
      if (!PHONE_RE.test(contactPhone)) next.contactPhone = "Enter a valid 10-digit mobile number";
    }
    setErrors(next);
    const invalid = Object.keys(next);
    if (invalid.length) {
      shakeFields(invalid);
      document.querySelector(`[data-field="${invalid[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const delivery: DeliveryAddress =
      selected === "new"
        ? {
            id: `${Date.now()}`,
            site: site.trim(),
            address: address.trim(),
            landmark: landmark.trim(),
            pincode,
            contactName: contactName.trim(),
            contactPhone,
            ...coords,
          }
        : saved.find((a) => a.id === selected)!;

    if (selected === "new" && save) {
      const rest = saved.filter((a) => !(a.address === delivery.address && a.pincode === delivery.pincode));
      writeStored("local", ADDRESSES_KEY, [delivery, ...rest].slice(0, MAX_SAVED_ADDRESSES));
    }

    writeStored("session", draftKey(item.id), { ...draft, delivery, notes: notes.trim() } satisfies BookingDraft);
    router.push(ROUTES.bookReview(item.id));
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6 px-4 pb-6 pt-3">
      <EquipmentSummary item={item}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-navy-950">{when}</p>
            <p className="text-[12px] text-slate-500">
              {draft.durationLabel} · {draft.slot} delivery
            </p>
          </div>
          <Link href={ROUTES.book(item.id)} className="shrink-0 text-[13px] font-semibold text-navy-950 underline underline-offset-2">
            Edit
          </Link>
        </div>
      </EquipmentSummary>

      {saved.length > 0 && (
        <Group label="Saved sites">
          {[...saved, null].map((a) => {
            const id = a?.id ?? "new";
            const active = id === selected;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setChoice(id)}
                className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0"
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-navy-950" : "border-slate-300"}`}>
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-navy-950" />}
                </span>
                {a ? (
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium text-navy-950">{addressTitle(a)}</span>
                    <span className="block truncate text-[12px] text-slate-500">
                      {a.address} · {a.pincode}
                    </span>
                  </span>
                ) : (
                  <span className="text-[14px] font-medium text-navy-950">New address</span>
                )}
              </button>
            );
          })}
        </Group>
      )}

      {selected === "new" && (
        <>
          <Group footer={locateError}>
            <button type="button" onClick={useCurrent} disabled={locating} className="flex w-full items-center gap-3 px-4 py-3 text-left">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f3f5] text-navy-950">
                {locating ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-navy-950" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <circle cx="12" cy="12" r="6.5" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
                  </svg>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-navy-950">
                  {coords ? "Location pinned" : "Use current location"}
                </span>
                <span className="block truncate text-[12px] text-slate-500">
                  {location
                    ? [location.area, location.city].filter(Boolean).join(", ")
                    : coords
                      ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} · helps the driver find you`
                      : "Pins the exact spot for the driver"}
                </span>
              </span>
              {coords && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              )}
            </button>
          </Group>

          <Group label="Site address">
            <FieldRow label="Site / building name (optional)">
              <input className={inputClass} placeholder="e.g. Tower B, Green Valley Project" value={site} onChange={(e) => setSite(e.target.value)} autoComplete="organization" />
            </FieldRow>
            <FieldRow label="Address" name="address" error={errors.address}>
              <textarea
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Plot / street, area, city"
                value={address}
                autoComplete="street-address"
                onChange={(e) => {
                  setAddress(e.target.value);
                  clear("address");
                }}
              />
            </FieldRow>
            <FieldRow label="Landmark (optional)">
              <input className={inputClass} placeholder="e.g. Near metro station" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
            </FieldRow>
            <FieldRow label="Pincode" name="pincode" error={errors.pincode}>
              <input
                className={inputClass}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                placeholder="6-digit pincode"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, ""));
                  clear("pincode");
                }}
              />
            </FieldRow>
          </Group>

          <Group label="Site contact" footer="Our driver calls this number before arriving.">
            <FieldRow label="Name" name="contactName" error={errors.contactName}>
              <input
                className={inputClass}
                placeholder="Who receives the machine"
                autoComplete="name"
                value={contactName}
                onChange={(e) => {
                  setContactName(e.target.value);
                  clear("contactName");
                }}
              />
            </FieldRow>
            <FieldRow label="Mobile number" name="contactPhone" error={errors.contactPhone}>
              <span className="flex items-center gap-2">
                <span className="text-[15px] text-slate-500">+91</span>
                <input
                  className={inputClass}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={contactPhone}
                  onChange={(e) => {
                    setContactPhone(e.target.value.replace(/\D/g, ""));
                    clear("contactPhone");
                  }}
                />
              </span>
            </FieldRow>
          </Group>
        </>
      )}

      <Group label="Notes for driver (optional)">
        <FieldRow label="Gate pass, entry gate, road width…">
          <textarea rows={2} className={`${inputClass} resize-none`} placeholder="e.g. Use gate 2, trailer can reach the site" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FieldRow>
      </Group>

      {selected === "new" && (
        <label className="flex items-center gap-3 px-1 text-[14px] text-navy-950">
          <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="h-5 w-5 accent-navy-950" />
          Save this site for future bookings
        </label>
      )}

      {/* sticky bottom */}
      <div aria-hidden className="h-[72px]" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-bold tracking-tight text-navy-950">{formatINR(draft.total)}</p>
            <p className="truncate text-[12px] text-slate-500">{draft.durationLabel} · incl. GST</p>
          </div>
          <button
            type="submit"
            className="h-[50px] rounded-2xl bg-navy-950 px-8 text-[16px] font-semibold text-white transition active:scale-[0.97]"
          >
            Continue
          </button>
        </div>
      </div>
    </form>
  );
}
