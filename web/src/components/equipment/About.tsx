"use client";

import { useState } from "react";

export default function About({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 py-3.5">
      <p className={`text-[14px] leading-relaxed text-slate-600 ${open ? "" : "line-clamp-3"}`}>{text}</p>
      <button type="button" onClick={() => setOpen((o) => !o)} className="mt-1 text-[13px] font-semibold text-navy-950">
        {open ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
