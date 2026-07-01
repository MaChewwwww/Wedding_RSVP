"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useMotionValue, useTransform, useSpring } from "motion/react";

/*
  Envelope gate — premium interactive 3D envelope mockup.
  Uses pure CSS 3D transforms, Framer Motion, and public/assets/seal_bigger.png.
  Features 4-way symmetrical unfolding flaps (top, bottom, left, right),
  a centered paper card containing the RSVP form, and text items nested
  directly inside the 3D perspective context to guarantee perfect Z-depth sorting.
*/

// Background floating petals
const PETALS = [
  { id: 0, x: "8%",  delay: 0,    dur: 9,  size: 20, color: "#d45d79", rotate: 30,  anim: "petal-drift-right" },
  { id: 1, x: "18%", delay: 2.2,  dur: 11, size: 14, color: "#ea728c", rotate: -20, anim: "petal-drift-left" },
  { id: 2, x: "28%", delay: 0.8,  dur: 10, size: 24, color: "#c73e5d", rotate: 45,  anim: "petal-drift-right" },
  { id: 3, x: "38%", delay: 3.5,  dur: 12, size: 16, color: "#e05275", rotate: 10,  anim: "petal-drift-left" },
  { id: 4, x: "48%", delay: 1.2,  dur: 9,  size: 22, color: "#a22041", rotate: -35, anim: "petal-drift-right" },
  { id: 5, x: "58%", delay: 2.5,  dur: 11, size: 15, color: "#e57c97", rotate: 60,  anim: "petal-drift-left" },
  { id: 6, x: "68%", delay: 4.0,  dur: 10, size: 23, color: "#d45d79", rotate: -15, anim: "petal-drift-right" },
  { id: 7, x: "78%", delay: 5.0,  dur: 13, size: 13, color: "#ea728c", rotate: 25,  anim: "petal-drift-left" },
  { id: 8, x: "88%", delay: 1.8,  dur: 10, size: 19, color: "#c73e5d", rotate: -40, anim: "petal-drift-right" },
  { id: 9, x: "94%", delay: 3.0,  dur: 12, size: 17, color: "#e05275", rotate: 15,  anim: "petal-drift-left" },
  { id: 10,x: "13%", delay: 4.5,  dur: 11, size: 21, color: "#a22041", rotate: 50,  anim: "petal-drift-right" },
  { id: 11,x: "83%", delay: 0.2,  dur: 9,  size: 16, color: "#e57c97", rotate: -10, anim: "petal-drift-left" },
];

const WIND_PETALS = Array.from({ length: 26 }).map((_, i) => {
  const size = 12 + Math.random() * 16;
  const colors = ["#d45d79", "#ea728c", "#c73e5d", "#e05275", "#a22041", "#e57c97"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const delay = 0.35 + Math.random() * 0.9; // Trigger as flaps open
  const duration = 2.2 + Math.random() * 1.5;
  const startX = -15 - Math.random() * 15; // offscreen left
  const startY = 55 + Math.random() * 40;  // bottom/middle-left
  const endX = 115 + Math.random() * 15;  // offscreen right
  const endY = -15 - Math.random() * 25;  // top/middle-right
  return { id: i, size, color, delay, duration, startX, startY, endX, endY };
});

function PetalSvg({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 22 28" fill="none" aria-hidden>
      <defs>
        <linearGradient id="petal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        d="M 11,6 C 9,3 4,3 2,8 C 0,13 3,21 11,26 C 19,21 22,13 20,8 C 18,3 13,3 11,6 Z"
        fill={color}
        opacity="0.95"
      />
      <path
        d="M 11,6 C 9,3 4,3 2,8 C 0,13 3,21 11,26 C 19,21 22,13 20,8 C 18,3 13,3 11,6 Z"
        fill="url(#petal-grad)"
      />
      <path
        d="M 11,8 C 10,12 10,18 11,22"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}


interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  type: "petal" | "sparkle";
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

export interface EnvelopeContextType {
  opened: boolean;
  cardOpened: boolean;
  animating: boolean;
  closeEnvelope: () => void;
}

export const EnvelopeContext = React.createContext<EnvelopeContextType | null>(null);

export function useEnvelope() {
  return React.useContext(EnvelopeContext);
}

export function EnvelopeGate({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [opened, setOpened] = React.useState(false);
  const [cardOpened, setCardOpened] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);
  const [particles, setParticles] = React.useState<Particle[]>([]);
  const isMobile = useIsMobile();
  // Card content shows in a fixed centered overlay once the rise animation settles
  const showOverlay = cardOpened && !animating;
  const titleLetters = Array.from("Jobert & April");

  const [swipeOutActive, setSwipeOutActive] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("rsvp-transition-active") === "true") {
      sessionStorage.removeItem("rsvp-transition-active");
      setSwipeOutActive(true);
    }
  }, []);

  // Motion values for mouse hover 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Damp tilt angle if the envelope is already opened to make form input comfortable
  const rotateX = useTransform(y, [-0.5, 0.5], cardOpened ? [1.5, -1.5] : [12, -12]);
  const rotateY = useTransform(x, [-0.5, 0.5], cardOpened ? [-1.5, 1.5] : [-12, 12]);

  const springConfig = { damping: 25, stiffness: 150 };
  const rX = useSpring(rotateX, springConfig);
  const rY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    x.set(0);
    y.set(0);
  };

  // Generate burst particles radiating from the seal center
  const triggerBurst = React.useCallback(() => {
    const petalColors = ["#d45d79", "#ea728c", "#c73e5d", "#e05275", "#a22041", "#e57c97"];
    const sparkleColors = ["#ffd700", "#fffbbf", "#ffffff"];
    const newParticles = Array.from({ length: isMobile ? 25 : 65 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 260;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance - 40;
      const rotation = Math.random() * 360 + 180;
      const scale = 0.5 + Math.random() * 0.8;
      const type = Math.random() > 0.5 ? ("petal" as const) : ("sparkle" as const);
      const color = type === "petal"
        ? petalColors[Math.floor(Math.random() * petalColors.length)]
        : sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      
      return {
        id: i,
        x: targetX,
        y: targetY,
        rotation,
        scale,
        color,
        type,
      };
    });
    setParticles(newParticles);
  }, [isMobile]);

  const open = React.useCallback(() => {
    if (animating || opened) return;
    setAnimating(true);
    triggerBurst();
    
    // Step 1: Wait for seal pop/fade, then fold flaps open
    setTimeout(() => {
      setOpened(true);
      
      // Step 2: Wait for flaps to open (800ms), then slide card up
      setTimeout(() => {
        setCardOpened(true);
        
        // Step 3: Wait for card to finish opening (1.5s), then finish animating
        setTimeout(() => {
          setAnimating(false);
        }, 1500);
      }, 800);
    }, 250);
  }, [animating, opened, triggerBurst]);

  const close = React.useCallback(() => {
    if (animating || !opened) return;
    setAnimating(true);
    
    // Step 1: Slide card down immediately
    setCardOpened(false);
    
    // Step 2: Wait for card to slide down (1000ms), then fold flaps closed
    setTimeout(() => {
      setOpened(false);
      
      // Step 3: Wait for flaps to close (1.2s), then finish animating
      setTimeout(() => {
        setAnimating(false);
      }, 1200);
    }, 1000);
  }, [animating, opened]);

  return (
    <EnvelopeContext.Provider value={{ opened, cardOpened, animating, closeEnvelope: close }}>
      <div
      className="full-svh overflow-hidden relative flex w-full flex-col items-center justify-center px-4"
      style={{
        perspective: 1000,
      }}
    >
      {/* Zoomed background image to crop out white paper edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/entrance_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scale(1.06)",
          zIndex: 0,
        }}
      />

      {/* Radial soft lighting overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(253, 195, 215, 0.85) 0%, rgba(225, 205, 242, 0.75) 45%, rgba(255, 255, 255, 0) 80%)",
          zIndex: 0,
        }}
      />
      {/* Background watercolor aura blobs */}
      {!reduceMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            className="absolute -left-20 -top-20 h-[450px] w-[450px] rounded-full filter blur-[60px] opacity-70"
            style={{ background: "radial-gradient(circle, rgba(253, 200, 218, 0.45) 0%, transparent 70%)" }}
            animate={{
              x: opened ? [0, 60, -30, 0] : [0, 40, -20, 0],
              y: opened ? [0, -50, 60, 0] : [0, -35, 45, 0],
              scale: opened ? 1.25 : 1.0,
              opacity: opened ? 0.95 : 0.7,
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-20 -bottom-20 h-[400px] w-[400px] rounded-full filter blur-[60px] opacity-70"
            style={{ background: "radial-gradient(circle, rgba(212, 190, 245, 0.4) 0%, transparent 70%)" }}
            animate={{
              x: opened ? [0, -70, 35, 0] : [0, -50, 25, 0],
              y: opened ? [0, 60, -50, 0] : [0, 40, -35, 0],
              scale: opened ? 1.25 : 1.0,
              opacity: opened ? 0.95 : 0.7,
            }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-1/4 -bottom-10 h-[350px] w-[350px] rounded-full filter blur-[50px] opacity-60"
            style={{ background: "radial-gradient(circle, rgba(180, 220, 185, 0.35) 0%, transparent 70%)" }}
            animate={{
              x: opened ? [0, 40, -40, 0] : [0, 30, -30, 0],
              y: opened ? [0, -30, 30, 0] : [0, -20, 20, 0],
              scale: opened ? 1.25 : 1.0,
              opacity: opened ? 0.85 : 0.6,
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Magical conic light rays background burst */}
      <AnimatePresence>
        {opened && (
          <motion.div
            key="rays-burst"
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%), repeating-conic-gradient(from 0deg, transparent 0deg 15deg, rgba(255,255,255,0.05) 15deg 30deg)",
              mixBlendMode: "overlay",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.85, 0.5, 0], scale: 1.75, rotate: 45 }}
            transition={{ duration: 3.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* One-time wind of petals sweep on open */}
      <AnimatePresence>
        {opened && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
            {(isMobile ? WIND_PETALS.slice(0, 10) : WIND_PETALS).map((wp) => (
              <motion.div
                key={wp.id}
                className="absolute"
                initial={{
                  x: `${wp.startX}vw`,
                  y: `${wp.startY}vh`,
                  opacity: 0,
                  rotate: Math.random() * 360,
                  scale: 0.5,
                }}
                animate={{
                  x: `${wp.endX}vw`,
                  y: `${wp.endY}vh`,
                  opacity: [0, 1, 1, 0],
                  rotate: Math.random() * 720 + 360,
                  scale: [0.5, 1.2, 1.0, 0.6],
                }}
                transition={{
                  duration: wp.duration,
                  delay: wp.delay,
                  ease: "easeOut",
                }}
              >
                <PetalSvg color={wp.color} size={wp.size} />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Floating petals background (continuous) */}
      {!reduceMotion && (isMobile ? PETALS.slice(0, 5) : PETALS).map((p) => (
        <div
          key={p.id}
          aria-hidden
          className="pointer-events-none absolute bottom-0 z-5"
          style={{
            left: p.x,
            animation: `${p.anim} ${p.dur}s ease-in-out ${p.delay}s infinite`,
            rotate: `${p.rotate}deg`,
          }}
        >
          <PetalSvg color={p.color} size={p.size} />
        </div>
      ))}

      {/* 3D Envelope Container */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: isMobile ? 0 : (opened && !animating ? 0 : (reduceMotion ? 0 : rX)),
          rotateY: isMobile ? 0 : (opened && !animating ? 0 : (reduceMotion ? 0 : rY)),
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-[460px] aspect-[500/350] preserve-3d select-none z-10"
      >
        {/* 0. Soft champagne glow directly behind the envelope */}
        <motion.div
          aria-hidden
          className="absolute -inset-28 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(250, 235, 224, 0.75) 0%, rgba(224, 205, 190, 0.5) 45%, transparent 70%)",
            filter: "blur(55px)",
          }}
          initial={{
            z: -250,
            scale: 1.3,
            opacity: 0.6,
          }}
          animate={{
            z: -250,
            scale: opened ? 1.8 : 1.3,
            opacity: opened ? 0.9 : 0.6,
          }}
          transition={{
            duration: 2.2,
            delay: 0.25,
            ease: "easeInOut",
          }}
        />

        {/* Heading inside 3D context: guarantees perfect layering and tilt synchronization */}
        <AnimatePresence>
          {!opened && (
            <motion.div
              className="absolute left-0 right-0 text-center select-none z-30 pointer-events-none"
              style={{
                top: isMobile ? "-135px" : "-160px",
                transformStyle: "preserve-3d",
              }}
              initial={{
                opacity: 0,
                z: 30,
                y: 10,
              }}
              animate={{
                opacity: 1,
                z: 30,
                y: [0, -6, 0],
              }}
              exit={{
                opacity: 0,
                z: 0,
                y: -20,
                transition: { duration: 0.35, ease: "easeIn" },
              }}
              transition={{
                y: {
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                },
                opacity: { duration: 0.6 },
                z: { duration: 0.6 },
              }}
            >
              <p className="font-sans text-xs sm:text-sm font-semibold tracking-[0.3em] text-blush-deep/90 uppercase">
                You are cordially invited
              </p>
              <h1 className="font-cursive text-6xl sm:text-7xl text-rose mt-2.5 leading-none drop-shadow-[0_4px_8px_rgba(184,48,74,0.15)] flex justify-center">
                {titleLetters.map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 18, rotate: -8 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{
                      duration: 0.65,
                      delay: 0.15 + index * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={char === " " ? "w-4" : "inline-block"}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                className="font-sans text-xs sm:text-sm font-bold tracking-[0.35em] text-blush-deep/80 uppercase mt-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + titleLetters.length * 0.04 }}
              >
                Wedding
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Envelope shadow */}
        <div
          aria-hidden
          className="absolute inset-x-6 -bottom-6 h-10 rounded-full bg-gradient-to-r from-rose/5 via-rose/15 to-rose/5 blur-md"
          style={{ transform: "translateZ(-30px)" }}
        />

        {/* 1. Envelope Back (Inside Wall) */}
        <div
          className="absolute inset-0 rounded-2xl border-1.5 border-[#d4a08c] overflow-hidden shadow-inner"
          style={{
            background: "linear-gradient(135deg, #f7dfd6 0%, #edd3c7 100%)",
            transform: "translateZ(-2px)",
          }}
        >
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#b8304a_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/15 to-transparent pointer-events-none" />
        </div>

        {/* 2. Top Flap (3D Rotating fold) */}
        <motion.div
          className="absolute left-0 right-0 top-0 origin-top preserve-3d"
          style={{
            height: "52%",
            transformStyle: "preserve-3d",
            zIndex: opened ? 15 : 35,
            willChange: "transform",
          }}
          animate={{
            rotateX: opened ? -175 : 0,
            z: opened ? 1 : 5,
          }}
          transition={{
            type: "spring",
            stiffness: 55,
            damping: 14,
            mass: 1.1,
            delay: 0,
          }}
        >
          {/* Front of Top Flap: Visible when closed */}
          <div className="absolute inset-0 backface-hidden z-40">
            <svg viewBox="0 0 500 182" fill="none" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
              <path d="M0 0 L250 180 L500 0 Z" fill="#edd5c5" stroke="#d4a08c" strokeWidth="1.5" />
              <path d="M15 5 L250 162 L485 5" fill="none" stroke="rgba(212,160,120,0.5)" strokeWidth="1.2" strokeDasharray="4 3" />
            </svg>
          </div>
          {/* Back of Top Flap: Visible when open (flipped up) */}
          <div
            className="absolute inset-0 backface-hidden"
            style={{ transform: "rotateY(180deg)", zIndex: 10 }}
          >
            <svg viewBox="0 0 500 182" fill="none" className="w-full h-full">
              <path d="M0 0 L250 180 L500 0 Z" fill="#ebd2c2" stroke="#d4a08c" strokeWidth="1.5" />
              <path d="M15 5 L250 162 L485 5" fill="none" stroke="rgba(212,160,120,0.35)" strokeWidth="1" />
            </svg>
          </div>
        </motion.div>

        {/* 3. Left Flap (3D Rotating fold) */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 origin-left preserve-3d"
          style={{
            width: "50%",
            transformStyle: "preserve-3d",
            zIndex: opened ? 10 : 30,
            willChange: "transform",
          }}
          animate={{
            rotateY: opened ? -175 : 0,
            z: opened ? 1 : 3,
          }}
          transition={{
            type: "spring",
            stiffness: 55,
            damping: 14,
            mass: 1.1,
            delay: 0.35,
          }}
        >
          <svg viewBox="0 0 250 350" fill="none" className="w-full h-full drop-shadow-[4px_0_8px_rgba(0,0,0,0.03)]">
            <path d="M0 0 L235 175 L0 350 Z" fill="#edd5c5" stroke="#d4a08c" strokeWidth="0.8" />
            <path d="M15 10 L220 175 L15 340" fill="none" stroke="rgba(212,160,120,0.4)" strokeWidth="1.2" strokeDasharray="4 3" />
          </svg>
        </motion.div>

        {/* 4. Right Flap (3D Rotating fold) */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 origin-right preserve-3d"
          style={{
            width: "50%",
            transformStyle: "preserve-3d",
            zIndex: opened ? 10 : 30,
            willChange: "transform",
          }}
          animate={{
            rotateY: opened ? 175 : 0,
            z: opened ? 1 : 3,
          }}
          transition={{
            type: "spring",
            stiffness: 55,
            damping: 14,
            mass: 1.1,
            delay: 0.35,
          }}
        >
          <svg viewBox="250 0 250 350" fill="none" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.03)]">
            <path d="M500 0 L265 175 L500 350 Z" fill="#edd5c5" stroke="#d4a08c" strokeWidth="0.8" />
            <path d="M485 10 L280 175 L485 340" fill="none" stroke="rgba(212,160,120,0.4)" strokeWidth="1.2" strokeDasharray="4 3" />
          </svg>
        </motion.div>

        {/* 5. Bottom Flap (3D Rotating fold) */}
        <motion.div
          className="absolute left-0 right-0 bottom-0 origin-bottom preserve-3d"
          style={{
            height: "52%",
            transformStyle: "preserve-3d",
            zIndex: opened ? 10 : 32,
            willChange: "transform",
          }}
          animate={{
            rotateX: opened ? 175 : 0,
            z: opened ? 1 : 4,
          }}
          transition={{
            type: "spring",
            stiffness: 55,
            damping: 14,
            mass: 1.1,
            delay: 0.75,
          }}
        >
          <svg viewBox="0 170 500 180" fill="none" className="w-full h-full drop-shadow-[0_-4px_8px_rgba(0,0,0,0.04)]">
            <path d="M0 350 L250 170 L500 350 Z" fill="#e5c8b7" stroke="#d4a08c" strokeWidth="1.2" />
            <path d="M15 340 L250 182 L485 340" fill="none" stroke="rgba(212,160,120,0.4)" strokeWidth="1.2" strokeDasharray="4 3" />
          </svg>
        </motion.div>

        {/* 6. Paper Card Stub — visual shell only; drives the rise/sink animation.
             Content is rendered in the fixed overlay below so it is always screen-centered. */}
        <motion.div
          className="absolute left-0 right-0 rounded-xl border-4 border-rose-200 z-20"
          style={{
            top: "5%",
            minHeight: "80px",
            background: "linear-gradient(to bottom, #fff0f2 0%, #fecdd3 100%)",
            transformOrigin: "bottom center",
            pointerEvents: "none",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            willChange: "transform, opacity",
          }}
          initial={{ opacity: 0, scale: 0.95, y: 0, rotate: -2.5, z: 2 }}
          animate={{
            y: cardOpened ? (isMobile ? -40 : -60) : 0,
            scale: cardOpened ? 1 : 0.95,
            // Fade out once overlay takes over, fade back in when closing
            opacity: showOverlay ? 0 : (cardOpened ? 1 : 0),
            rotate: cardOpened ? 0 : -2.5,
            z: cardOpened && !animating ? 15 : 2,
            boxShadow: cardOpened
              ? "0 30px 60px rgba(15, 23, 42, 0.12), 0 1px 0 rgba(255, 255, 255, 0.4) inset"
              : "0 12px 30px rgba(15, 23, 42, 0.06), 0 1px 0 rgba(255, 255, 255, 0.4) inset",
          }}
          transition={{ type: "spring", stiffness: 40, damping: 15, mass: 1.2 }}
        >
          {/* Paper texture */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#3a3330_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none rounded-lg" />
          {/* Double border */}
          <div className="absolute inset-2.5 border border-rose/15 rounded-lg pointer-events-none" />
        </motion.div>

        {/* 7. Gold Monogram Wax Seal Trigger */}
        <AnimatePresence>
          {!opened && (
            <motion.div
              key="wax-seal"
              className="absolute z-50 cursor-pointer preserve-3d"
              style={{
                left: "50%",
                top: "50.8%",
                transformStyle: "preserve-3d",
              }}
              initial={{
                x: "-50%",
                y: "-50%",
                scale: 1,
                z: 6,
              }}
              animate={{
                scale: [1, 1.03, 1],
                z: 6,
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: "easeInOut",
              }}
              exit={{
                scale: [1, 1.25, 0],
                opacity: [1, 1, 0],
                z: 6,
                transition: { duration: 0.4, ease: "easeInOut" },
              }}
            >
              <motion.button
                type="button"
                onClick={open}
                aria-label="Break the seal and open invitation"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                className="relative flex items-center justify-center focus:outline-none border-0 bg-transparent p-0"
              >
                <img
                  src="/assets/seal_bigger.png"
                  alt="Gold Wax Seal"
                  className="w-[95px] h-[95px] object-contain drop-shadow-[0_8px_16px_rgba(184,48,74,0.3)] hover:drop-shadow-[0_12px_20px_rgba(184,48,74,0.4)] transition-all duration-200"
                />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shockwave expanding ring overlay */}
        <AnimatePresence>
          {opened && (
            <motion.div
              key="shockwave"
              className="absolute rounded-full border-4 border-rose-300/40 pointer-events-none z-50"
              style={{
                left: "50%",
                top: "50.8%",
                width: 80,
                height: 80,
                x: "-50%",
                y: "-50%",
              }}
              initial={{ scale: 0.6, opacity: 1, z: 80 }}
              animate={{ scale: 3.5, opacity: 0, z: 80 }}
              transition={{ duration: 0.95, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* 8. Dynamic Sparkles & Petal Burst */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute pointer-events-none z-50"
            style={{ left: "50%", top: "50.8%" }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.1, rotate: 0, z: 80 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: 0,
              scale: p.scale,
              rotate: p.rotation,
              z: 80,
            }}
            transition={{
              duration: 1.6 + Math.random() * 1.0,
              ease: "easeOut",
            }}
          >
            {p.type === "petal" ? (
              <PetalSvg color={p.color} size={16} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill={p.color}>
                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
              </svg>
            )}
          </motion.div>
        ))}

        {/* Tap hint inside 3D context: guarantees perfect layering and tilt synchronization */}
        <AnimatePresence>
          {!opened && (
            <motion.div
              className="absolute left-0 right-0 text-center select-none z-30 pointer-events-none animate-float"
              style={{
                bottom: isMobile ? "-45px" : "-55px",
                transformStyle: "preserve-3d",
              }}
              initial={{
                opacity: 0,
                z: 30,
              }}
              animate={{
                opacity: 1,
                z: 30,
              }}
              exit={{
                opacity: 0,
                z: 0,
                transition: { duration: 0.3 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <p
                className="text-sm sm:text-base font-bold tracking-[0.25em] text-rose/75 uppercase select-none"
                style={{ animation: animating ? "none" : "float-up 3s ease-in-out infinite" }}
              >
                Tap the seal to open
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Fixed screen-centered card overlay — appears after the stub rise animation settles */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="card-overlay"
            className="fixed z-[60] w-[calc(100vw-2rem)] max-w-[460px] rounded-xl border-4 border-rose-200"
            style={{
              top: "50%",
              left: "50%",
              maxHeight: "90dvh",
              overflowY: "auto",
              background: "linear-gradient(to bottom, #fff0f2 0%, #fecdd3 100%)",
              boxShadow: "0 30px 60px rgba(15, 23, 42, 0.18), 0 1px 0 rgba(255, 255, 255, 0.4) inset",
              WebkitFontSmoothing: "subpixel-antialiased",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
              willChange: "transform, opacity",
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
            }}
            initial={{ opacity: 0, x: "-50%", y: "-40%", scale: 0.95, z: 0 }}
            animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1, z: 0 }}
            exit={{ opacity: 0, x: "-50%", y: "-44%", scale: 0.97, z: 0, transition: { duration: 0.22, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 80, damping: 18, mass: 0.9 }}
          >
            {/* Paper texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#3a3330_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none rounded-lg" />

            {/* Shimmer glint sweep */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-10 rounded-lg overflow-hidden"
              style={{
                transform: "translateZ(0)",
                WebkitMaskImage: "-webkit-radial-gradient(white, black)",
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.45) 55%, transparent 70%)",
                  transform: "translateZ(0)",
                  willChange: "transform",
                }}
                initial={{ x: "-100%", z: 0 }}
                animate={{ x: "100%", z: 0 }}
                transition={{ duration: 1.8, delay: 0.6, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Double border overlay */}
            <div className="absolute inset-2.5 border border-rose/15 rounded-lg pointer-events-none z-10" />

            {/* Back button — top left of card */}
            <motion.button
              type="button"
              onClick={close}
              className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center bg-rose-100/60 hover:bg-rose-200/80 border border-rose-300/35 text-rose-700 hover:text-rose-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-300 z-40 cursor-pointer shadow-sm"
              aria-label="Go back"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.25, ease: "easeOut" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </motion.button>

            {/* Close button — top right of card */}
            <motion.button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-rose-100/60 hover:bg-rose-200/80 border border-rose-300/35 text-rose-700 hover:text-rose-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-300 z-40 cursor-pointer shadow-sm"
              aria-label="Close envelope"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.25, ease: "easeOut" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </motion.button>

            {/* Card content */}
            <div className="relative w-full flex flex-col p-4 sm:p-5 select-text">
              {/* Flourished Invitation Header */}
              <div className="mb-2 text-center shrink-0 select-none">
                <motion.p
                  className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-blush-deep/80"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  Wedding Invitation
                </motion.p>
                <motion.h2
                  className="font-cursive text-3xl text-rose mt-0.5 leading-none"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  Jobert &amp; April
                </motion.h2>
                <div className="flex justify-center mt-2.5">
                  <motion.div
                    className="h-px bg-gradient-to-r from-transparent via-rose/30 to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: 96 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                  />
                </div>
              </div>

              {/* RSVP Form Content */}
              <div className="flex-1 flex flex-col justify-center">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-right link to Celebration */}
      <div className="absolute bottom-6 right-6 z-30 select-none">
        <Link
          href="/celebration"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-card hover:bg-white/80 transition-all duration-200 text-rose-800 hover:text-rose-600 font-semibold tracking-wider text-[10px] uppercase shadow-sm group hover:-translate-y-0.5"
        >
          <span>Celebration</span>
          <svg
            className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Premium Fade-Out Reveal Curtain */}
      <AnimatePresence>
        {swipeOutActive && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            onAnimationComplete={() => setSwipeOutActive(false)}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #fde8f0 0%, #f0a8bc 50%, #e07898 100%)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
    </EnvelopeContext.Provider>
  );
}
