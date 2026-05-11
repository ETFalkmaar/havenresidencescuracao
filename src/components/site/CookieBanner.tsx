"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_NAME = "cookie_consent";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]!) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

const ONE_YEAR = 60 * 60 * 24 * 365;

export function CookieBanner({ lang }: { lang: "en" | "nl" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = readCookie(COOKIE_NAME);
    if (!choice) setVisible(true);
  }, []);

  if (!visible) return null;

  function accept() {
    setCookie(COOKIE_NAME, "accepted", ONE_YEAR);
    setVisible(false);
  }
  function reject() {
    setCookie(COOKIE_NAME, "essential-only", ONE_YEAR);
    setVisible(false);
  }

  const t =
    lang === "nl"
      ? {
          title: "Cookies",
          body:
            "We gebruiken alleen essentiële cookies om de website te laten werken (taalkeuze, login). Met jouw toestemming mogen we in de toekomst optionele analytische cookies plaatsen.",
          accept: "Akkoord met alle",
          reject: "Alleen essentiële",
          more: "Meer info",
        }
      : {
          title: "Cookies",
          body:
            "We only use essential cookies needed for the site to work (language, login). With your consent we may add optional analytics cookies in the future.",
          accept: "Accept all",
          reject: "Essential only",
          more: "Learn more",
        };

  return (
    <div
      role="dialog"
      aria-label={t.title}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 max-w-md mx-auto md:mx-0"
    >
      <div className="rounded-3xl bg-white border border-black/10 shadow-soft p-5 md:p-6">
        <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute mb-2">
          {t.title}
        </p>
        <p className="text-sm text-ink leading-relaxed">{t.body}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={accept}
            className="inline-flex items-center px-4 py-2 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-ink-soft transition"
          >
            {t.accept}
          </button>
          <button
            type="button"
            onClick={reject}
            className="inline-flex items-center px-4 py-2 rounded-full bg-paper-warm hover:bg-paper-tint text-ink text-[13px] font-medium transition border border-black/5"
          >
            {t.reject}
          </button>
          <Link
            href="/cookies"
            className="inline-flex items-center px-4 py-2 rounded-full text-ink-mute hover:text-ink text-[13px] transition"
          >
            {t.more}
          </Link>
        </div>
      </div>
    </div>
  );
}
