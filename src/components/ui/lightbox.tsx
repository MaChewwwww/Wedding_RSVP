"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, Maximize2 } from "lucide-react";
import { createPortal } from "react-dom";

export function LightboxImage({
  src,
  alt,
  wrapperClassName = "",
  imageClassName = "",
  fill = false,
  width,
  height,
  sizes,
  quality,
}: {
  src: string;
  alt: string;
  wrapperClassName?: string;
  imageClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <div 
        className={`group/lightbox overflow-hidden cursor-pointer ${wrapperClassName}`} 
        onClick={() => setIsOpen(true)}
      >
        <Image 
          src={src} 
          alt={alt} 
          fill={fill} 
          width={width} 
          height={height} 
          sizes={sizes} 
          quality={quality} 
          className={imageClassName} 
        />
        {/* Clickable Indicator */}
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm transition-all duration-300 group-hover/lightbox:scale-110 sm:h-10 sm:w-10 sm:bg-black/30 sm:opacity-0 sm:group-hover/lightbox:opacity-100">
          <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
              onClick={() => setIsOpen(false)}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 sm:right-8 sm:top-8 z-[10000] rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                className="relative h-[90vh] w-[95vw] max-w-6xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  quality={100}
                  className="object-contain"
                  sizes="(max-width: 1200px) 95vw, 1200px"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
