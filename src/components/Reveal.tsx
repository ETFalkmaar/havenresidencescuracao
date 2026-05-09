"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// Subtle slide-up reveal that stays visible if JS never runs.
// We start at opacity 1 (so SSR is readable) and let framer-motion overlay
// a small entrance translate on first paint when supported.
const baseVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      variants={{
        hidden: baseVariants.hidden!,
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      initial="visible"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerGroup({
  children,
  className,
  staggerChildren = 0.08,
}: {
  children: ReactNode;
  className?: string;
  staggerChildren?: number;
}) {
  return (
    <motion.div
      initial="visible"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={baseVariants} initial="visible" className={className}>
      {children}
    </motion.div>
  );
}
