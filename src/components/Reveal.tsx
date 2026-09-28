"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span";
};

export default function Reveal({ children, delay = 0, className = "", as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // Progressive enhancement: server-rendered content stays visible even if
  // hydration/scripts fail. Only hide below-the-fold items once JS is ready.
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    // Mobile/touch shows the content directly; desktop keeps the scroll reveal.
    if (window.matchMedia("(hover: none), (pointer: coarse), (max-width: 640px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Never hide content that is already visible on the first paint.
    if (node.getBoundingClientRect().top <= window.innerHeight - 32) return;

    setPending(true);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPending(false);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -36px 0px" },
    );
    observer.observe(node);

    // Defensive fallback for browsers where an observer does not fire.
    const safeguard = window.setTimeout(() => setPending(false), 9000);
    return () => {
      observer.disconnect();
      window.clearTimeout(safeguard);
    };
  }, []);

  const Tag = as as "div";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`reveal ${pending ? "is-pending" : "is-visible"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
