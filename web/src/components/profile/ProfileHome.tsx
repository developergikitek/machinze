"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Group } from "@/components/equipment/Group";
import { logout } from "@/lib/auth";
import { SUPPORT_PHONE } from "@/lib/bookingDraft";
import { bookingStatus } from "@/lib/bookingsStore";
import { docSpec, maskedNumber } from "@/lib/kyc";
import { ROUTES } from "@/lib/routes";
import { useBookings } from "@/lib/useBookings";

import { ProfileIcons } from "./icons";
import KycCard from "./KycCard";
import MenuRow from "./MenuRow";
import { useAccount } from "./useAccount";

const APP_VERSION = "1.0.0";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const KYC_BADGE = {
  pending: { label: "In review", className: "bg-blue-50 text-blue-700" },
  verified: { label: "Verified", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Action needed", className: "bg-red-50 text-red-600" },
};

export default function ProfileHome() {
  const router = useRouter();
  const { ready, profile, session, kyc, addresses } = useAccount();
  const { bookings, todayISO } = useBookings();
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!ready) return <div className="m-4 h-[520px] animate-pulse rounded-2xl bg-white" />;

  const name = profile?.fullName || "Guest";
  const upcoming = bookings && todayISO ? bookings.filter((b) => bookingStatus(b, todayISO) === "upcoming").length : 0;
  const stats = [
    ["Bookings", bookings?.length ?? 0],
    ["Upcoming", upcoming],
    ["Saved sites", addresses.length],
  ] as const;

  const signOut = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="space-y-5 px-4 pb-8 pt-4">
      <Link href={ROUTES.profileEdit} className="flex items-center gap-4 rounded-2xl bg-white p-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-950 text-[18px] font-semibold text-white">
          {initials(name) || ProfileIcons.user}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-semibold text-navy-950">{name}</span>
          <span className="block truncate text-[13px] text-slate-500">{profile?.email || "Add your email"}</span>
          <span className="block text-[13px] text-slate-500">{session?.phone ? session.phone.replace(/^(\+91)(\d{5})(\d{5})$/, "$1 $2 $3") : ""}</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="m9 6 6 6-6 6" />
        </svg>
      </Link>

      <KycCard kyc={kyc} />

      <dl className="grid grid-cols-3 rounded-2xl bg-white py-3 text-center">
        {stats.map(([label, value], i) => (
          <div key={label} className={i ? "border-l border-slate-100" : ""}>
            <dd className="text-[18px] font-semibold text-navy-950">{value}</dd>
            <dt className="text-[12px] text-slate-500">{label}</dt>
          </div>
        ))}
      </dl>

      <Group label="Account">
        <MenuRow icon={ProfileIcons.user} title="My profile" subtitle="Name, email, customer type" href={ROUTES.profileEdit} />
        <MenuRow
          icon={ProfileIcons.idCard}
          title="ID proof"
          subtitle={kyc ? `${docSpec(kyc.docType).label} ${maskedNumber(kyc)}` : "Aadhaar, PAN, DL or GST"}
          href={ROUTES.profileIdProof}
          badge={
            kyc ? (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${KYC_BADGE[kyc.status].className}`}>
                {KYC_BADGE[kyc.status].label}
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Pending</span>
            )
          }
        />
        <MenuRow
          icon={ProfileIcons.pin}
          title="My addresses"
          subtitle={addresses.length ? `${addresses.length} saved site${addresses.length === 1 ? "" : "s"}` : "Delivery sites"}
          href={ROUTES.profileAddresses}
        />
        <MenuRow
          icon={ProfileIcons.card}
          title="Payment methods"
          subtitle="Cards, UPI & more"
          badge={<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">Soon</span>}
        />
      </Group>

      <Group label="More">
        <MenuRow icon={ProfileIcons.inbox} title="Inbox" subtitle="Booking updates & offers" href={ROUTES.notifications} />
        <MenuRow icon={ProfileIcons.help} title="Help & support" subtitle="Call us, 7 AM – 10 PM" href={`tel:${SUPPORT_PHONE}`} external />
        <MenuRow icon={ProfileIcons.info} title="About Machinze" subtitle={`Version ${APP_VERSION}`} />
      </Group>

      <div className="rounded-2xl bg-white">
        {confirmLogout ? (
          <div className="p-4">
            <p className="text-[15px] font-semibold text-navy-950">Log out of Machinze?</p>
            <p className="mt-1 text-[13px] text-slate-500">You can log back in with your mobile number anytime.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirmLogout(false)} className="h-11 rounded-xl border border-slate-200 text-[14px] font-semibold text-navy-950">
                Cancel
              </button>
              <button type="button" onClick={signOut} className="h-11 rounded-xl bg-red-600 text-[14px] font-semibold text-white">
                Log out
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmLogout(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-red-600">
            {ProfileIcons.logout}
            <span className="text-[15px] font-medium">Log out</span>
          </button>
        )}
      </div>
    </div>
  );
}
