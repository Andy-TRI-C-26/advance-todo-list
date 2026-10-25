"use client";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Toast, ToastType } from "./types";

const TOAST_DURATION_MS = 5000;

type ShowToast = (message: string, type: ToastType) => void;

// Dua context terpisah: modul lain hanya butuh fungsi `toast` (yang tidak
// pernah berubah), jadi mereka tidak ikut render ulang saat daftar toast berubah.
const ShowToastContext = createContext<ShowToast | null>(null);
const ToastListContext = createContext<Toast[]>([]);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback<ShowToast>((message, type) => {
    const id = Math.random();
    setToasts((list) => [...list, { id, message, type }]);
    // hilang otomatis
    setTimeout(
      () => setToasts((list) => list.filter((t) => t.id !== id)),
      TOAST_DURATION_MS,
    );
  }, []);

  return (
    <ShowToastContext.Provider value={showToast}>
      <ToastListContext.Provider value={toasts}>
        {children}
      </ToastListContext.Provider>
    </ShowToastContext.Provider>
  );
}

/** Dipakai modul lain: const toast = useToast(); toast("Berhasil", "success") */
export function useToast() {
  const showToast = useContext(ShowToastContext);
  if (!showToast)
    throw new Error("useToast harus dipakai di dalam <NotificationsProvider>");
  return showToast;
}

/** Hanya dipakai oleh <ToastViewport> di dalam modul ini. */
export const useToastList = () => useContext(ToastListContext);
