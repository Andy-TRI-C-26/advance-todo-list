"use client";
import { Moon } from "lucide-react";
import { useSettings } from "../settings-provider";

export function SleepHoursNotice() {
  const { settings } = useSettings();
  const dotted = (time: string) => time.replace(":", ".");

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Moon className="size-4" /> Jam tidur wajib
      </p>
      <p className="mt-2 text-sm text-amber-800/80 dark:text-amber-200/70">
        Auto-scheduler tidak mengalokasikan tugas pada pukul{" "}
        <strong>
          {dotted(settings.sleepStart)} – {dotted(settings.sleepEnd)}
        </strong>
        .
      </p>
    </div>
  );
}
