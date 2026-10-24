"use client";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysLeft } from "@/lib/schedule";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export const inp =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800";
export const COLORS: Record<string, { blk: string; ico: string }> = {
  blue: {
    blk: "border-indigo-500 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200",
    ico: "bg-indigo-100 text-indigo-600",
  },
  violet: {
    blk: "border-violet-500 bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200",
    ico: "bg-violet-100 text-violet-600",
  },
  rose: {
    blk: "border-rose-500 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
    ico: "bg-rose-100 text-rose-600",
  },
  amber: {
    blk: "border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    ico: "bg-amber-100 text-amber-600",
  },
};

export const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const BASE_W = 448; // max-w-md
// 400 (kolom form) + 329 (jarak + garis + panel 288px) + 48 (padding kartu)
const WIDE_W = 777;

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/** Tinggi isi modal berubah dengan halus, bukan melompat. */
export function AnimatedHeight({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <motion.div
      initial={false}
      animate={{ height: h ?? "auto" }}
      transition={{ duration: 0.3, ease: EASE }}
      className="-mx-1 overflow-hidden px-1"
    >
      <div ref={ref} className="space-y-4 pb-1">
        {children}
      </div>
    </motion.div>
  );
}

export function AppLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-5" />
      </div>
      <span className="text-xl font-bold tracking-tight">
        nugas<span className="text-primary">.in</span>
      </span>
    </div>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function DeadlineBadge({
  deadline,
  now,
}: {
  deadline: string;
  now: Date;
}) {
  const hours = (+new Date(deadline) - +now) / 36e5,
    d = daysLeft(deadline, now);
  const label =
    hours < 0
      ? "Terlewat"
      : hours < 24
        ? `${Math.max(1, Math.ceil(hours))} jam`
        : `H-${d}`;
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        hours < 24
          ? "bg-red-100 text-red-700"
          : d <= 3
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700",
      )}
    >
      {label}
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function Modal({
  title,
  onClose,
  onSubmit,
  error,
  wide,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const isLg = useMediaQuery("(min-width: 1024px)");
  const maxWidth = wide && isLg ? WIDE_W : BASE_W;
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        initial={{ opacity: 0, y: 16, scale: 0.97, maxWidth }}
        animate={{ opacity: 1, y: 0, scale: 1, maxWidth }}
        transition={{ duration: 0.3, ease: EASE }}
        className="max-h-[92vh] w-full space-y-4 overflow-y-auto overflow-x-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <X className="size-5 text-slate-400" />
          </button>
        </div>
        <AnimatedHeight>{children}</AnimatedHeight>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
          Simpan
        </button>
      </motion.form>
    </motion.div>
  );
}
