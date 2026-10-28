import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  href?: string;
  // href ki jagah (e.g. tel:)
  external?: boolean;
  badge?: ReactNode;
};

const chevron = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export default function MenuRow({ icon, title, subtitle, href, external, badge }: Props) {
  const body = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-navy-950">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-navy-950">{title}</span>
        <span className="block truncate text-[12px] text-slate-500">{subtitle}</span>
      </span>
      {badge}
      {href && chevron}
    </>
  );
  const className = "flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0";

  if (!href) return <div className={`${className} opacity-70`}>{body}</div>;
  if (external)
    return (
      <a href={href} className={className}>
        {body}
      </a>
    );
  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
