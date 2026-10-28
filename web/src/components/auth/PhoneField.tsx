"use client";

import Field, { inputClass } from "./Field";
import { ChevronDownIcon } from "./icons";

export const COUNTRIES = [
  { code: "IN", flag: "🇮🇳", dial: "+91", pattern: /^[6-9]\d{9}$/, maxLength: 10 },
  { code: "AE", flag: "🇦🇪", dial: "+971", pattern: /^5\d{8}$/, maxLength: 9 },
  { code: "SA", flag: "🇸🇦", dial: "+966", pattern: /^5\d{8}$/, maxLength: 9 },
  { code: "GB", flag: "🇬🇧", dial: "+44", pattern: /^7\d{9}$/, maxLength: 10 },
  { code: "US", flag: "🇺🇸", dial: "+1", pattern: /^\d{10}$/, maxLength: 10 },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export function countryOf(code: CountryCode) {
  return COUNTRIES.find((c) => c.code === code)!;
}

type Props = {
  country: CountryCode;
  number: string;
  error?: string;
  onCountryChange: (code: CountryCode) => void;
  onNumberChange: (value: string) => void;
};

export default function PhoneField({ country, number, error, onCountryChange, onNumberChange }: Props) {
  const current = countryOf(country);

  return (
    <Field
      label="Mobile Number"
      name="mobile"
      error={error}
      icon={
        // Native <select> upar transparent rakha hai — mobile pe OS ka picker khulta hai
        <span className="relative -ml-1 flex items-center gap-1.5 border-r border-slate-200 pr-3 text-navy-950">
          <span className="text-[20px] leading-none">{current.flag}</span>
          <span className="text-base font-semibold">{current.dial}</span>
          <ChevronDownIcon className="h-4 w-4 text-slate-500" />
          <select
            aria-label="Country code"
            className="absolute inset-0 cursor-pointer opacity-0"
            value={country}
            onChange={(e) => onCountryChange(e.target.value as CountryCode)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} {c.dial}
              </option>
            ))}
          </select>
        </span>
      }
    >
      <input
        className={inputClass}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="Enter mobile number"
        maxLength={current.maxLength}
        value={number}
        onChange={(e) => onNumberChange(e.target.value.replace(/\D/g, ""))}
      />
    </Field>
  );
}
