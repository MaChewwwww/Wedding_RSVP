"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export function CelebrationLayout({ children }: { children: React.ReactNode }) {
  const [isExiting, setIsExiting] = React.useState(false);
  const [clickPos, setClickPos] = React.useState<{ x: number; y: number } | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const handleExit = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      const x = customEvent.detail?.x ?? (window.innerWidth / 2);
      const y = customEvent.detail?.y ?? (window.innerHeight * 0.75);
      
      setClickPos({ x, y });
      setIsExiting(true);
      
      sessionStorage.setItem("rsvp-transition-active", "true");
      setTimeout(() => {
        router.push("/");
      }, 1450); // wait for slower expanding animation to complete
    };
    window.addEventListener("page-exit-rsvp", handleExit);
    return () => window.removeEventListener("page-exit-rsvp", handleExit);
  }, [router]);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* Main Page Content */}
      <motion.div
        animate={isExiting ? { scale: 0.99, opacity: 0.9 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="w-full min-h-screen flex flex-col"
      >
        {children}
      </motion.div>

      {/* Premium Rose-Gold Expanding Circle Curtain */}
      <AnimatePresence>
        {isExiting && clickPos && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 50, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-50 pointer-events-none rounded-full"
            style={{
              left: clickPos.x - 50,
              top: clickPos.y - 50,
              width: 100,
              height: 100,
              background: "linear-gradient(135deg, #fde8f0 0%, #f0a8bc 50%, #e07898 100%)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
