"use client";
import { Check } from "lucide-react";
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
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex max-w-xs items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg",
            TOAST_COLOR[t.type],
          )}
        >
          {t.type === "success" && (
            <Check className="size-4 text-emerald-400" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
