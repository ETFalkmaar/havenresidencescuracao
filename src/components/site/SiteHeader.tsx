"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { LanguageSwitcher } from "../LanguageSwitcher";
import type { Lang } from "@/lib/i18n/translations";

type NavItem = { href: string; label: string };

export function SiteHeader({
  brandName,
  lang,
  signedIn,
  isAdmin,
}: {
  brandName: string;
  lang: Lang;
  signedIn: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname() ?? "/";
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 32);
  });

  const nav: NavItem[] = [
    { href: "/about", label: lang === "nl" ? "Over ons" : "About" },
    { href: "/gallery", label: lang === "nl" ? "Galerij" : "Gallery" },
    { href: "/reviews", label: lang === "nl" ? "Reviews" : "Reviews" },
    { href: "/property", label: lang === "nl" ? "Residenties" : "Property" },
    { href: "/contact", label: lang === "nl" ? "Contact" : "Contact us" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-4"
    >
      <div
        className={`mx-auto max-w-6xl transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-pill"
            : "bg-white/85 backdrop-blur-sm shadow-pill"
        } rounded-full border border-black/5`}
      >
        <div className="flex items-center justify-between gap-4 px-5 md:px-7 py-3">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0"
            aria-label={brandName}
          >
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white text-[11px] font-semibold tracking-tight shadow-sm">
              {brandName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:inline-flex items-baseline gap-1.5">
              <span className="font-display font-bold text-ink text-[17px] leading-none tracking-tight lowercase">
                {brandName}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-2 text-[14px] font-medium transition rounded-full ${
                  isActive(item.href)
                    ? "text-ink"
                    : "text-ink-mute hover:text-ink"
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-paper-warm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* CTA + utilities */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:block">
              <LanguageSwitcher current={lang} />
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex text-[12px] uppercase tracking-widest px-3 py-1.5 rounded-full text-ink-mute hover:text-ink hover:bg-paper-warm transition"
              >
                Admin
              </Link>
            )}
            {signedIn ? (
              <Link
                href="/account"
                className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-[14px] font-medium transition shadow-pill"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                </svg>
                <span className="hidden sm:inline">{lang === "nl" ? "Account" : "Account"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-[14px] font-medium transition shadow-pill"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v18h-6" />
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                </svg>
                <span className="hidden sm:inline">{lang === "nl" ? "Inloggen" : "Sign in"}</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-paper-warm transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <path d="M6 6L18 18M6 18L18 6" />
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mx-auto max-w-6xl mt-3 rounded-3xl bg-white shadow-soft border border-black/5 overflow-hidden"
        >
          <nav className="flex flex-col p-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-2xl text-[15px] font-medium transition ${
                  isActive(item.href)
                    ? "bg-paper-warm text-ink"
                    : "text-ink-mute hover:bg-paper-tint hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-black/5 mt-2 pt-2 px-4 pb-3 flex items-center justify-between">
              <LanguageSwitcher current={lang} />
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="text-[12px] uppercase tracking-widest text-ink-mute hover:text-ink"
                >
                  Admin
                </Link>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
