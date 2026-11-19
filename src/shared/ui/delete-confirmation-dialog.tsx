"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

type DeleteConfirmationDialogProps = {
  title: string;
  itemName: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteConfirmationDialog({
  title,
  itemName,
  description,
  onConfirm,
  onClose,
}: DeleteConfirmationDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmed = confirmationText === "Hapus";

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-red-100 bg-white p-6 text-slate-950 shadow-2xl backdrop:bg-slate-950/45 backdrop:backdrop-blur-[3px] dark:border-red-950 dark:bg-slate-900 dark:text-slate-50"
    >
        <div className="flex items-start justify-between gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <AlertTriangle className="size-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog hapus"
            className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <h2 id="delete-dialog-title" className="mt-5 text-xl font-bold">
          {title}
        </h2>
        <p
          id="delete-dialog-description"
          className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
        >
          {description}
        </p>
        <p className="mt-4 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
          <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-red-500" />
          <span>“{itemName}”</span>
        </p>

        <label className="mt-5 block text-sm font-medium">
          Ketik{" "}
          <span className="font-semibold text-red-700 dark:text-red-300">
            Hapus
          </span>{" "}
          untuk melanjutkan
          <input
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
            placeholder="Hapus"
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-red-950"
          />
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!confirmed}
            onClick={() => {
              dialogRef.current?.close();
              onConfirm();
            }}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hapus sekarang
          </button>
        </div>
    </dialog>
  );
}
