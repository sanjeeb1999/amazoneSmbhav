"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useSiteSettings } from "@/shared/layout/useSiteSettings";

export function Providers({ children }: { children: React.ReactNode }) {
  const settings = useSiteSettings();

  useEffect(() => {
    if (settings.siteTitle) {
      document.title = settings.siteTitle;
    }

    if (!settings.logo) return;
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.logo;
  }, [settings.logo, settings.siteTitle]);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: "#0f172a",
            color: "#fff",
          },
          success: {
            style: { background: "#166534", color: "#fff" },
          },
          error: {
            style: { background: "#b91c1c", color: "#fff" },
          },
        }}
      />
    </>
  );
}
