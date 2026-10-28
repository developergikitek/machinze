import { ReactNode } from "react";

type Props = {
  label: ReactNode;
  icon?: ReactNode;
  error?: string;
  trailing?: ReactNode;
  // scroll-to-first-error ke liye
  name?: string;
  children: ReactNode;
};

export default function Field({ label, icon, error, trailing, name, children }: Props) {
  return (
    <label className="block" data-field={name}>
      <span className="mb-2 block text-[14px] font-semibold text-navy-950">{label}</span>
      <span
        className={`group flex h-[52px] items-center gap-3 rounded-2xl border bg-white px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition focus-within:border-navy-800 focus-within:ring-4 focus-within:ring-navy-800/10 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      >
        {icon && <span className="flex text-slate-500 transition duration-300 group-focus-within:scale-110 group-focus-within:text-navy-800">{icon}</span>}
        {children}
        {trailing}
      </span>
      <FieldError error={error} />
    </label>
  );
}

export function FieldError({ error }: { error?: string }) {
  return error ? <span className="mt-1.5 block text-[13px] text-red-500">{error}</span> : null;
}

// autofill-reset: browser autofill ka blue/yellow background hata ke white rakhta hai (globals.css)
export const inputClass =
  "autofill-reset h-full min-w-0 flex-1 bg-transparent text-base text-navy-950 caret-navy-800 outline-none placeholder:text-slate-400";
