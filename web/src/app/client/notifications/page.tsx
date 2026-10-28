import type { Metadata } from "next";

import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Inbox" };

export default function NotificationsPage() {
  return <ComingSoon title="Inbox" />;
}
