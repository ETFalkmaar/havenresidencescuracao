"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Lang, Translations } from "@/lib/i18n/translations";

export function AnimatedHeader({
  brandName,
  lang,
  t,
  signedIn = false,
}: {
  brandName: string;
  lang: Lang;
  t: Translations["nav"];
  signedIn?: boolean;
}) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
  });

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-neutral-950/85 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="text-white font-light text-lg tracking-wide hover:opacity-80 transition"
        >
          {brandName}
        </Link>
        <div className="flex items-center gap-5 lg:gap-8">
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/85">
            <Link href="/#residences" className="hover:text-white transition relative group">
              {t.residences}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/beheer" className="hover:text-white transition relative group">
              {t.management}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/#about" className="hover:text-white transition relative group">
              {t.about}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/#contact" className="hover:text-white transition relative group">
              {t.contact}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>

          {signedIn ? (
            <Link
              href="/account"
              className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/40 text-white/85 hover:bg-white/10 hover:text-white transition"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/40 text-white/85 hover:bg-white/10 hover:text-white transition"
            >
              Sign in
            </Link>
          )}

          <LanguageSwitcher current={lang} variant="light" />
        </div>
      </div>
    </motion.header>
  );
}
