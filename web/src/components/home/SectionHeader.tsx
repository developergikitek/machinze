"use client";

import Link from "next/link";

type Props = {
  title: string;
  href?: string;
  action?: string;
  onClick?: () => void;
};

export default function SectionHeader({ title, href, action = "See all", onClick }: Props) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[19px] font-bold tracking-tight text-navy-950">{title}</h2>
      {href ? (
        <Link href={href} className="text-[14px] font-semibold text-navy-950/70 transition active:opacity-60">
          {action}
        </Link>
      ) : onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="text-[14px] font-semibold text-navy-950/70 transition active:opacity-60"
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}
