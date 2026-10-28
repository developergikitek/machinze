import type { Metadata } from "next";

import { jakarta } from "@/app/fonts";
import ExcavatorScene from "@/components/auth/ExcavatorScene";
import Logo from "@/components/auth/Logo";
import OnboardingForm from "@/components/auth/OnboardingForm";
import Aurora from "@/components/fx/Aurora";

export const metadata: Metadata = { title: "Complete Profile" };

// OTP verify ke baad naye user ke liye — sirf naam, email (optional) aur customer type
export default function OnboardingPage() {
  return (
    <main className={`${jakarta.className} relative min-h-dvh overflow-hidden bg-white px-6 pb-10 pt-6`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px]">
        <Aurora />
      </div>
      <ExcavatorScene className="pointer-events-none absolute -right-5 top-4 w-[42%] max-w-[260px] -scale-x-100 opacity-95" />

      <div className="relative animate-rise motion-reduce:animate-none">
        <Logo size="sm" tagline="Rent. Build. Succeed." className="mt-6" />
        <h1 className="mt-10 text-[26px] font-extrabold leading-tight tracking-tight text-navy-950">
          Complete Your Profile
        </h1>
        <p className="mt-1.5 max-w-[300px] text-[14px] leading-relaxed text-slate-500">
          Just a few details to get you started with Machinze.
        </p>
      </div>

      <div className="relative mt-7">
        <OnboardingForm askLocation />
      </div>
    </main>
  );
}
