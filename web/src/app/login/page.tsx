import type { Metadata } from "next";

import { jakarta } from "@/app/fonts";
import Aurora from "@/components/fx/Aurora";
import ExcavatorScene from "@/components/auth/ExcavatorScene";
import LoginForm from "@/components/auth/LoginForm";
import Logo from "@/components/auth/Logo";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className={`${jakarta.className} flex min-h-dvh flex-col bg-white`}>
      <section className="relative h-[290px] overflow-hidden bg-white">
        <Aurora />
        <ExcavatorScene className="absolute -left-4 bottom-6 w-[60%] max-w-[360px]" />
        <div className="absolute right-4 top-[30%] flex max-w-[44%] flex-col items-start gap-3 animate-rise motion-reduce:animate-none">
          <Logo size="sm" />
          <p className="pl-1 text-[14px] leading-snug text-slate-600">
            Rent Heavy Equipment,
            <br />
            Build Better
          </p>
        </div>
      </section>

      <main className="relative -mt-8 flex-1 rounded-t-[32px] bg-white px-6 pb-10 pt-9 shadow-[0_-16px_40px_-20px_rgba(15,23,42,0.25)] animate-rise [animation-delay:120ms] motion-reduce:animate-none">
        <LoginForm />
      </main>
    </div>
  );
}
