"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { postToNative } from "@/lib/native";

// Native app ko route change batata hai, taaki header title aur footer ka active tab sync rahe
export default function NativeBridge() {
  const pathname = usePathname();

  useEffect(() => {
    postToNative({ type: "route", path: pathname, title: document.title });
  }, [pathname]);

  return null;
}
