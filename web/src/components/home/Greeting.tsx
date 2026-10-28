"use client";

import { useSyncExternalStore } from "react";

import { getSavedProfile } from "@/lib/auth";

const noopSubscribe = () => () => {};

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Waqt aur naam client pe hi pata hain — server pe "Hello" render, hydrate hote hi asli greeting
export default function Greeting() {
  const text = useSyncExternalStore(
    noopSubscribe,
    () => {
      const name = getSavedProfile()?.fullName.split(" ")[0];
      const hello = greetingFor(new Date().getHours());
      return name ? `${hello}, ${name}` : hello;
    },
    () => "Hello",
  );

  return (
    <div className="mt-5">
      <p className="text-[14px] font-medium text-slate-500">{text} 👋</p>
      <h1 className="mt-0.5 text-[22px] font-extrabold tracking-tight text-navy-950">Find equipment near you</h1>
    </div>
  );
}
