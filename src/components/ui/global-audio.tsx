"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function GlobalAudio() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    const audio = new Audio("/assets/wildflowers.mp3");
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const savedState = typeof window !== 'undefined' ? localStorage.getItem("wedding-audio-state") : null;

    const tryPlay = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          localStorage.setItem("wedding-audio-state", "playing");
          window.removeEventListener("click", tryPlay);
          window.removeEventListener("touchstart", tryPlay);
          window.removeEventListener("scroll", tryPlay);
        }).catch(() => {
          // Play prevented by browser, wait for next interaction
        });
      }
    };

    // If the user explicitly muted, respect it and do NOT attach autoplay listeners
    if (savedState !== "muted") {
      tryPlay();
      window.addEventListener("click", tryPlay);
      window.addEventListener("touchstart", tryPlay);
      window.addEventListener("scroll", tryPlay, { passive: true });
    }

    return () => {
      audio.pause();
      audio.src = "";
      window.removeEventListener("click", tryPlay);
      window.removeEventListener("touchstart", tryPlay);
      window.removeEventListener("scroll", tryPlay);
    };
  }, []); // Run once on mount

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem("wedding-audio-state", "muted");
    } else {
      setIsPlaying(true);
      localStorage.setItem("wedding-audio-state", "playing");
      audioRef.current.play().catch((err) => {
        console.warn("Play failed", err);
        setIsPlaying(false);
        localStorage.setItem("wedding-audio-state", "muted");
      });
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 1 }}
      onClick={toggleMute}
      className="fixed bottom-6 left-6 z-[99999] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
      style={{
        background: "rgba(255, 252, 245, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(200, 150, 60, 0.4)",
        boxShadow: "0 8px 32px rgba(200, 150, 60, 0.2)",
      }}
      aria-label={isPlaying ? "Mute music" : "Play music"}
    >
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.div
            key="playing"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Volume2 className="h-5 w-5 text-gold" />
          </motion.div>
        ) : (
          <motion.div
            key="muted"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <VolumeX className="h-5 w-5 text-muted-ink" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
