"use client";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useMediaQuery } from "../hooks/use-media-query";
import { AnimatedHeight } from "./animated-height";
import { EASE } from "./motion";

const BASE_WIDTH = 448; // max-w-md
// 400 (kolom form) + 329 (jarak + garis + panel 288px) + 48 (padding kartu)
const WIDE_WIDTH = 777;

type ModalProps = {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  error?: string;
  /** Lebarkan modal (dipakai saat panel tanggal terbuka di layar besar). */
  wide?: boolean;
  children: React.ReactNode;
};

/** Dialog form umum: judul, isi, pesan error, dan tombol "Simpan". */
export function Modal({
  title,
  onClose,
  onSubmit,
  error,
  wide,
  children,
}: ModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const maxWidth = wide && isDesktop ? WIDE_WIDTH : BASE_WIDTH;

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
