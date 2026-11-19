"use client";
import { useEffect, useRef } from "react";
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="app-modal-title"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
      }}
      className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] overflow-visible rounded-2xl border-0 bg-transparent p-0 shadow-none backdrop:bg-slate-950/45 backdrop:backdrop-blur-[2px]"
    >
      <motion.form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        initial={{ opacity: 0, y: 16, scale: 0.97, maxWidth }}
        animate={{ opacity: 1, y: 0, scale: 1, maxWidth }}
        transition={{ duration: 0.3, ease: EASE }}
        className="no-scrollbar mx-auto max-h-[92dvh] w-full space-y-4 overflow-y-auto overflow-x-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <h2 id="app-modal-title" className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Tutup">
            <X className="size-5 text-slate-400 dark:text-slate-500 dark:hover:text-slate-300" />
          </button>
        </div>
        <AnimatedHeight>{children}</AnimatedHeight>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
          Simpan
        </button>
      </motion.form>
    </dialog>
  );
}
