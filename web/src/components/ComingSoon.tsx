import { jakarta } from "@/app/fonts";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <main className={`${jakarta.className} flex min-h-dvh flex-col items-center justify-center gap-2 bg-white px-6 text-center`}>
      <h1 className="text-[20px] font-bold text-navy-950">{title}</h1>
      <p className="text-[14px] text-slate-500">Coming soon</p>
    </main>
  );
}
