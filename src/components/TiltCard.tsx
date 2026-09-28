"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useSpring } from "motion/react";
import { useFinePointer } from "@/lib/use-fine-pointer";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
};

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

export default function TiltCard({
  children,
  className = "",
  intensity = 12,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const finePointer = useFinePointer();

  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);
  const scale = useSpring(1, SPRING);
  const glowX = useSpring(50, SPRING);
  const glowY = useSpring(50, SPRING);
  const glowOpacity = useSpring(0, { stiffness: 160, damping: 24 });

  const glowBackground = useMotionTemplate`radial-gradient(420px circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.22), transparent 55%)`;

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!finePointer) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * intensity * 2);
    rotateX.set((0.5 - py) * intensity * 2);
    scale.set(1.02);
    glowX.set(px * 100);
    glowY.set(py * 100);
    glowOpacity.set(1);
  }

  function handleLeave() {
    if (!finePointer) return;
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    glowOpacity.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={finePointer ? handleMove : undefined}
      onMouseLeave={finePointer ? handleLeave : undefined}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 1000,
      }}
      className={`card-3d relative ${className}`}
    >
      {children}
      {glare && finePointer ? (
        <motion.div
          aria-hidden
          style={{ background: glowBackground, opacity: glowOpacity }}
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
        />
      ) : null}
    </motion.div>
  );
}
