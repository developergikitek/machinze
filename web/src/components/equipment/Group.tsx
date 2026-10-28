import type { ReactNode } from "react";

// iOS / SaaS style grouped list — chhota label, safed card, andar rows
export function Group({ label, children, footer }: { label?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section>
      {label && <h3 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-slate-500">{label}</h3>}
      <div className="overflow-hidden rounded-2xl bg-white">{children}</div>
      {footer && <p className="mt-2 px-1 text-[12px] leading-snug text-slate-500">{footer}</p>}
    </section>
  );
}

export function Row({ label, value, hint }: { label: ReactNode; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex min-h-[48px] items-center justify-between gap-4 border-b border-slate-100 px-4 py-2.5 last:border-b-0">
      <span className="text-[14px] text-slate-600">{label}</span>
      <span className="text-right">
        <span className="block text-[14px] font-medium text-navy-950">{value}</span>
        {hint && <span className="block text-[11px] text-emerald-600">{hint}</span>}
      </span>
    </div>
  );
}
