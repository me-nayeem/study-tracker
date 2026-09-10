"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function BackForwardRefresh() {
  const router = useRouter();

  useEffect(() => {
    function handlePopState() {
      if (window.location.pathname === "/dashboard") {
        router.refresh();
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  return null;
}