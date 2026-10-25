"use client";
import { useState } from "react";
import { Clock3, FileText, Plus, Sparkles } from "lucide-react";
import { useNow } from "@/shared/hooks/use-now";
import { SectionTitle } from "@/shared/ui/section-title";
import { TaskForm, TaskList, useTasks, type Task } from "@/modules/tasks";
import { usePlan, WeekCalendar } from "@/modules/scheduling";
import { StatCard } from "./stat-card";

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

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">
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
          <p className="mt-2 text-sm text-slate-500">
            Biar nugas lebih terarah, tanpa mengorbankan waktu istirahat.
          </p>
        </div>
        <button
          onClick={() => setForm("baru")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="size-4" /> Tambah tugas
        </button>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
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
              <span className="text-sm font-medium text-slate-400">jam</span>
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

      <section className="mb-8">
        <SectionTitle
          eyebrow="Prioritas"
          title="Tugas yang perlu diperhatikan"
        />
        <div className="mt-4 grid gap-3">
          <TaskList onEdit={setForm} limitedTaskIds={limitedTaskIds} />
        </div>
      </section>

      <section>
        <SectionTitle
          eyebrow="Auto-schedule"
          title="Jadwal minggu ini"
          action={
            <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
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
