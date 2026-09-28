"use client";

import { useEffect } from "react";
import { IMAGE_PLACEHOLDER } from "@/lib/images";

/** If any photo fails to load, swap it for an on-brand gradient instead of a broken icon. */
function recover(img: HTMLImageElement) {
  if (img.dataset.vitalisFallback === "1") return;
  img.dataset.vitalisFallback = "1";
  img.src = IMAGE_PLACEHOLDER;
}

export default function ImageGuard() {
  useEffect(() => {
    const onError = (event: Event) => {
      if (event.target instanceof HTMLImageElement) recover(event.target);
    };
    window.addEventListener("error", onError, true);
    Array.from(document.images).forEach((img) => {
      if (img.complete && img.naturalWidth === 0) recover(img);
    });
    return () => window.removeEventListener("error", onError, true);
  }, []);
  return null;
}
