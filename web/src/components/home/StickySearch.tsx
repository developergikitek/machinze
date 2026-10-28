"use client";

import { useEffect, useRef, useState } from "react";

import SearchPill from "./SearchPill";

// Scroll pe upar chipak jaata hai (Swiggy jaisa); chipakne pe neeche halki shadow.
// Dhyan: ye <main> ka seedha child rehna chahiye — sticky apne parent ke andar hi chipakta hai.
export default function StickySearch() {
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-px" />
      <div
        className={`sticky top-0 z-20 -mx-4 bg-white px-4 py-2 transition-shadow duration-200 ${
          stuck ? "shadow-[0_8px_16px_-12px_rgba(11,20,55,0.35)]" : ""
        }`}
      >
        <SearchPill />
      </div>
    </>
  );
}
