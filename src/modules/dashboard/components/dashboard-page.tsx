"use client";
import { useState } from "react";
import { Clock3, FileText, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNow } from "@/shared/hooks/use-now";
import { SectionTitle } from "@/shared/ui/section-title";
import { TaskForm, TaskList, useTasks, type Task } from "@/modules/tasks";
import { usePlan, WeekCalendar } from "@/modules/scheduling";
import { StatCard } from "./stat-card";

const PAGE_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

// Halaman ini hanya MENYUSUN modul lain: statistik, daftar tugas (tasks),
// dan kalender (scheduling). Logika bisnisnya ada di modul masing-masing.
export function DashboardPage() {
  const { tasks } = useTasks();
  const plan = usePlan();
  const now = useNow();

  // "baru" = form tambah, Task = form ubah, null = form tertutup
  const [form, setForm] = useState<Task | "baru" | null>(null);

  const activeTasks = tasks.filter((t) => !t.completed);
  const doneCount = tasks.length - activeTasks.length;
  const hoursNeeded = activeTasks.reduce((sum, t) => sum + t.hours, 0);
  const freeHours = Math.round(plan.freeMinutesNext7Days / 60);
  const limitedTaskIds = new Set(Object.keys(plan.shortfall));
  const riskyTasks = activeTasks
    .map((task) => ({ task, risk: plan.riskByTask[task.id] ?? 0 }))
    .filter(({ risk }) => risk >= 60)
    .sort((a, b) => b.risk - a.risk);
  const trackedMinutes = tasks.reduce(
    (sum, task) => sum + (task.actualMinutes ?? 0),
    0,
  );
  const trackedHours = Math.round((trackedMinutes / 60) * 10) / 10;
  const estimatedHours = tasks.reduce((sum, task) => sum + task.hours, 0);
  const estimateAccuracy =
    trackedMinutes > 0 && estimatedHours > 0
      ? Math.round((trackedMinutes / 60 / estimatedHours) * 100)
      : null;

  return (
    <>
      <motion.div
        className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: PAGE_EASE }}
      >
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            {now.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Rencanakan harimu.
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Biar nugas lebih terarah, tanpa mengorbankan waktu istirahat.
          </p>
        </div>
        <motion.button
          data-tour="add-task"
          onClick={() => setForm("baru")}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_rgba(22,50,79,0.16)] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          <Plus className="size-4" /> Tambah jadwal
        </motion.button>
      </motion.div>

      <section
        data-tour="dashboard-stats"
        className="mb-8 grid gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Tugas aktif"
          icon={<FileText className="size-4" />}
          tint="bg-indigo-50 text-indigo-600 dark:bg-indigo-950"
          value={activeTasks.length}
          note={`${doneCount} tugas selesai`}
        />
        <StatCard
          label="Waktu dibutuhkan"
          icon={<Clock3 className="size-4" />}
          tint="bg-teal-50 text-teal-600 dark:bg-teal-950"
          value={
            <>
              {hoursNeeded}{" "}
              <span className="text-sm font-medium text-slate-400 dark:text-slate-400">jam</span>
            </>
          }
          note={`dari ${freeHours} jam waktu luang 7 hari ke depan`}
        />
        <StatCard
          label="Keseimbangan"
          icon={<Sparkles className="size-4" />}
          tint="bg-emerald-50 text-emerald-600 dark:bg-emerald-950"
          value={limitedTaskIds.size ? "Padat" : "Baik"}
          note="Jam tidur selalu aman"
        />
      </section>

      {riskyTasks.length > 0 && (
        <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                Rescue Mode
              </p>
              <h3 className="mt-1 text-lg font-bold">Ada tugas yang mulai berisiko</h3>
              <p className="mt-1 text-sm text-amber-900/70 dark:text-amber-100/70">
                Fokuskan energi ke tugas berikut sebelum jadwal menjadi tidak realistis.
              </p>
            </div>
            <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-100">
              {riskyTasks.length} perlu diselamatkan
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {riskyTasks.slice(0, 4).map(({ task, risk }) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm dark:bg-slate-900/60"
              >
                <span className="truncate font-medium">{task.title}</span>
                <span className="ml-3 shrink-0 font-bold text-amber-700 dark:text-amber-300">
                  Risiko {risk}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {trackedMinutes > 0 && (
        <section className="mb-8 rounded-2xl border border-teal-200 bg-teal-50/70 p-5 dark:border-teal-900 dark:bg-teal-950/30">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            Insight kebiasaan
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="text-lg font-bold">
              {trackedHours} jam fokus tercatat
            </p>
            <p className="text-sm text-teal-900/70 dark:text-teal-100/70">
              {estimateAccuracy !== null
                ? `Rasio waktu aktual terhadap estimasi: ${estimateAccuracy}%`
                : "Terus catat sesi agar estimasi berikutnya makin personal."}
            </p>
          </div>
          <p className="mt-2 text-sm text-teal-900/70 dark:text-teal-100/70">
            Gunakan tombol jam pada tugas untuk mencatat sesi fokus 25 menit.
            Data ini dipakai scheduler untuk menyesuaikan risiko deadline.
          </p>
        </section>
      )}

      <section data-tour="task-list" className="mb-8">
        <SectionTitle
          eyebrow="Prioritas"
          title="Tugas yang perlu diperhatikan"
        />
        <div className="mt-4 grid gap-3">
          <TaskList onEdit={setForm} limitedTaskIds={limitedTaskIds} />
        </div>
      </section>

      <section data-tour="week-calendar">
        <SectionTitle
          eyebrow="Auto-schedule"
          title="Jadwal minggu ini"
          action={
            <span className="hidden items-center gap-1.5 text-xs text-slate-400 dark:text-slate-400 sm:flex">
              <span className="size-2 rounded-full bg-indigo-500" /> Kuliah
              (seret untuk pindah){" "}
              <span className="ml-2 size-2 rounded-full bg-teal-400" /> Waktu
              nugas
            </span>
          }
        />
        <div className="mt-4">
          <WeekCalendar />
        </div>
      </section>

      {form && (
        <TaskForm
          task={form === "baru" ? undefined : form}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}
