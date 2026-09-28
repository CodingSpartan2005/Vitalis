"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

type Props = {
  src: string;
  poster?: string;
  credit?: string;
  label?: string;
  className?: string;
  rounded?: string;
};

export default function DemoVideo({
  src,
  poster,
  credit,
  label,
  className = "",
  rounded = "rounded-2xl",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
      setStarted(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  return (
    <div className={`group relative overflow-hidden ${rounded} bg-black/40 ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="none"
        onClick={toggle}
        onEnded={() => setPlaying(false)}
        className="h-full w-full cursor-pointer object-cover"
      />

      {/* overlay controls */}
      <div
        onClick={toggle}
        className={`absolute inset-0 grid cursor-pointer place-items-center transition-all duration-300 ${
          playing ? "bg-transparent opacity-0 group-hover:opacity-100" : "bg-black/35 opacity-100"
        }`}
      >
        <motion.span
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-black/55 backdrop-blur-sm"
        >
          {playing ? (
            <Pause className="h-6 w-6 text-white" />
          ) : (
            <Play className="ml-0.5 h-6 w-6 text-white" fill="currentColor" />
          )}
        </motion.span>
      </div>

      {/* label */}
      {label && !started ? (
        <span className="pointer-events-none absolute top-3 left-3 rounded-full border border-white/20 bg-black/65 px-3 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase backdrop-blur">
          ▶ {label}
        </span>
      ) : null}

      {/* mute toggle */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Activar sonido" : "Silenciar"}
        className="absolute right-3 bottom-3 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/60 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
      >
        {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>

      {credit ? (
        <span className="pointer-events-none absolute bottom-2 left-3 text-[9px] text-white/45">
          {credit}
        </span>
      ) : null}
    </div>
  );
}
