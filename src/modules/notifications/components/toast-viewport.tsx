"use client";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { useToastList } from "../notifications-provider";
import type { ToastType } from "../types";

const TOAST_COLOR: Record<ToastType, string> = {
  urgent: "bg-red-600",
  warn: "bg-amber-500",
  success: "bg-slate-900",
};

/** Tempat toast ditampilkan (pojok kanan bawah). Pasang sekali di layout. */
export function ToastViewport() {
  const toasts = useToastList();
  return (
    <div className="fixed bottom-5 right-5 z-[60] space-y-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              "flex max-w-xs items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg",
              TOAST_COLOR[t.type],
            )}
          >
            {t.type === "success" && (
              <Check className="size-4 text-emerald-400" />
            )}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
