"use client";

// Reusable 3D tilt-on-hover wrapper. Same physics as the homepage
// AnimatedPropertyCard so the residence detail gallery and other cards
// across the site feel like the same product.

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";

export function Tilt3D({
  children,
  className,
  intensity = 6,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 200,
    damping: 20,
  });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`will-change-transform ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}
