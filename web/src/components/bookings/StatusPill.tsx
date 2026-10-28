import { BookingStatus } from "@/lib/bookingsStore";

const STYLES: Record<BookingStatus, { label: string; className: string; dot: string }> = {
  upcoming: { label: "Upcoming", className: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  ongoing: { label: "Ongoing", className: "bg-amber-50 text-amber-700", dot: "bg-amber-brand animate-pulse motion-reduce:animate-none" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
};

export default function StatusPill({ status }: { status: BookingStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${s.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
