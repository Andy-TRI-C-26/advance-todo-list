"use client";
import { Sparkles } from "lucide-react";
import { usePlan } from "@/modules/scheduling";
import { useTasks } from "@/modules/tasks";

/** Kartu "Fokus saat ini" di sidebar: total jam tugas + persen yang sudah teralokasi. */
export function FocusCard() {
  const { tasks } = useTasks();
  const plan = usePlan();

  const totalHours = tasks
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + t.hours, 0);
  const missingHours =
    Object.values(plan.shortfall).reduce((a, b) => a + b, 0) / 60;
  const percentAllocated = totalHours
    ? Math.max(0, Math.round((1 - missingHours / totalHours) * 100))
    : 100;

  return (
    <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
      <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900">
        <Sparkles className="size-4" />
      </div>
      <p className="text-sm font-semibold">Fokus saat ini</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        {totalHours
          ? `Kamu punya ${totalHours} jam tugas yang perlu diselesaikan.`
          : "Tidak ada tugas aktif. Santai dulu!"}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${percentAllocated}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        {percentAllocated}% waktu teralokasi
      </p>
    </div>
  );
}
