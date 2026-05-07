"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

export function AnimatedHeader({ brandName }: { brandName: string }) {
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
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-white font-light text-lg tracking-wide hover:opacity-80 transition"
        >
          {brandName}
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/85">
          <Link href="/#residences" className="hover:text-white transition relative group">
            Residences
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/#about" className="hover:text-white transition relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/#contact" className="hover:text-white transition relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
