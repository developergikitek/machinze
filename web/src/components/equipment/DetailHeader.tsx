"use client";

import { useRouter } from "next/navigation";
import { addTransitionType, startTransition, useState } from "react";

import Logo from "@/components/auth/Logo";
import type { Equipment } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";
import { useIsSaved } from "@/lib/saved";

const iconButton =
  "flex h-10 w-10 items-center justify-center rounded-full text-navy-950 transition hover:bg-slate-100 active:scale-90";

// Detail page ka apna header — native header yahan hidden hai (app-config → header.hiddenOn)
export default function DetailHeader({ item }: { item: Equipment }) {
  const { name } = item;
  const router = useRouter();
  const [liked, toggleLiked] = useIsSaved(item);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // user ne share cancel kiya
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white px-2">
      <button
        type="button"
        aria-label="Back"
        onClick={() =>
          startTransition(() => {
            addTransitionType("nav-back");
            if (window.history.length > 1) router.back();
            else router.push(ROUTES.home);
          })
        }
        className={iconButton}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </button>

      <Logo size="xs" />

      <div className="flex">
        <button
          type="button"
          aria-label={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
          onClick={toggleLiked}
          className={iconButton}
        >
          <svg
            key={String(liked)}
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={liked ? "#ef4444" : "none"}
            stroke={liked ? "#ef4444" : "currentColor"}
            strokeWidth="2"
            className={liked ? "fx-pop" : ""}
            aria-hidden
          >
            <path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7 3.9 4 7.1 4c2 0 3.4 1.1 4.9 2.8C13.5 5.1 14.9 4 16.9 4c3.2 0 5.5 3 4.3 6.6C19.5 15.4 12 20 12 20Z" />
          </svg>
        </button>
        <button type="button" aria-label="Share" onClick={share} className={`${iconButton} relative`}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5v6A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-6" />
          </svg>
          {copied && (
            <span className="absolute right-0 top-11 whitespace-nowrap rounded-lg bg-navy-950 px-2 py-1 text-[11px] font-semibold text-white animate-rise">
              Link copied
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
