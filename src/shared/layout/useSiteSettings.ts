"use client";

import { useEffect, useState } from "react";

type SiteSettings = {
  siteTitle: string;
  logo: string;
  contactEmail: string;
  socialLinks: {
    facebook: string;
    linkedin: string;
    twitter: string;
    instagram: string;
  };
};

type SettingsApiResponse = {
  success: boolean;
  data?: {
    siteTitle?: unknown;
    logo?: unknown;
    contactEmail?: unknown;
    socialLinks?: unknown;
  };
};

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: "",
  logo: "",
  contactEmail: "",
  socialLinks: {
    facebook: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  },
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const result = (await res.json()) as SettingsApiResponse;
        if (!res.ok || !result.success || !result.data || cancelled) return;

        const social =
          typeof result.data.socialLinks === "object" && result.data.socialLinks !== null
            ? (result.data.socialLinks as Record<string, unknown>)
            : {};

        setSettings({
          siteTitle: typeof result.data.siteTitle === "string" ? result.data.siteTitle : "",
          logo: typeof result.data.logo === "string" ? result.data.logo : "",
          contactEmail: typeof result.data.contactEmail === "string" ? result.data.contactEmail : "",
          socialLinks: {
            facebook: typeof social.facebook === "string" ? social.facebook : "",
            linkedin: typeof social.linkedin === "string" ? social.linkedin : "",
            twitter: typeof social.twitter === "string" ? social.twitter : "",
            instagram: typeof social.instagram === "string" ? social.instagram : "",
          },
        });
      } catch {
        // Keep defaults when settings API fails.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
