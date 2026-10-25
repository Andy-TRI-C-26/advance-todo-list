"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "./motion";

/** Tinggi isi modal berubah dengan halus, bukan melompat. */
export function AnimatedHeight({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ height: height ?? "auto" }}
      transition={{ duration: 0.3, ease: EASE }}
      className="-mx-1 overflow-hidden px-1"
    >
      <div ref={ref} className="space-y-4 pb-1">
        {children}
      </div>
    </motion.div>
  );
}
