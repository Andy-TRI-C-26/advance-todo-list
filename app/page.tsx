"use client";
import { useState } from "react";
import {
  Check,
  Clock3,
  FileText,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/store";
import type { Task } from "@/lib/types";
import { DeadlineBadge, SectionTitle } from "@/components/common";
import { TaskForm } from "@/components/forms";
import { WeekCalendar } from "@/components/week-calendar";

const card =
  "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900";
function Stat({
  label,
  icon,
  tint,
  value,
  note,
}: {
  label: string;
  icon: React.ReactNode;
  tint: string;
  value: React.ReactNode;
  note: string;
}) {
  return (
    <div className={card}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <div className={cn("grid size-9 place-items-center rounded-xl", tint)}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, plan, now, toggleTask, delTask } = useData();
  const [form, setForm] = useState<Task | "baru" | null>(null);
  const byDl = (a: Task, b: Task) =>
    +new Date(a.deadline) - +new Date(b.deadline);
  const open = data.tasks.filter((t) => !t.completed).sort(byDl),
    done = data.tasks.filter((t) => t.completed);
  const hours = open.reduce((s, t) => s + t.hours, 0),
    free = Math.round(plan.free7 / 60);
  const cname = (id: string) =>
    data.courses.find((c) => c.id === id)?.name ?? "Umum";
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
        <Stat
          label="Tugas aktif"
          icon={<FileText className="size-4" />}
          tint="bg-indigo-50 text-indigo-600 dark:bg-indigo-950"
          value={open.length}
          note={`${done.length} tugas selesai`}
        />
        <Stat
          label="Waktu dibutuhkan"
          icon={<Clock3 className="size-4" />}
          tint="bg-teal-50 text-teal-600 dark:bg-teal-950"
          value={
            <>
              {hours}{" "}
              <span className="text-sm font-medium text-slate-400">jam</span>
            </>
          }
          note={`dari ${free} jam waktu luang 7 hari ke depan`}
        />
        <Stat
          label="Keseimbangan"
          icon={<Sparkles className="size-4" />}
          tint="bg-emerald-50 text-emerald-600 dark:bg-emerald-950"
          value={Object.keys(plan.short).length ? "Padat" : "Baik"}
          note="Jam tidur selalu aman"
        />
      </section>
      <section className="mb-8">
        <SectionTitle
          eyebrow="Prioritas"
          title="Tugas yang perlu diperhatikan"
        />
        <div className="mt-4 grid gap-3">
          {data.tasks.length === 0 && (
            <p className={cn(card, "text-center text-sm text-slate-500")}>
              Belum ada tugas. Klik &quot;Tambah tugas&quot; untuk memulai.
            </p>
          )}
          {[...open, ...done].map((t) => (
            <div
              key={t.id}
              className={cn(
                "flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition dark:border-slate-800 dark:bg-slate-900",
                t.completed && "opacity-60",
              )}
            >
              <button
                onClick={() => toggleTask(t.id)}
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-md border-2",
                  t.completed
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 text-transparent",
                )}
                aria-label={
                  t.completed
                    ? `Batalkan selesai ${t.title}`
                    : `Tandai selesai ${t.title}`
                }
              >
                {t.completed && <Check className="size-3" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      t.completed && "line-through",
                    )}
                  >
                    {t.title}
                  </p>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800">
                    {cname(t.courseId)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Estimasi {t.hours} jam · prioritas {t.priority.toLowerCase()}{" "}
                  ·{" "}
                  {new Date(t.deadline).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                {!t.completed && plan.short[t.id] && (
                  <span className="mt-1.5 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                    Waktu luang terbatas! Prinsipnya: yang penting selesai
                    daripada bagus.
                  </span>
                )}
              </div>
              {!t.completed && (
                <DeadlineBadge deadline={t.deadline} now={now} />
              )}
              <button
                onClick={() => setForm(t)}
                className="text-slate-400 hover:text-slate-700"
                aria-label={`Ubah ${t.title}`}
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() =>
                  confirm(`Hapus tugas "${t.title}"?`) && delTask(t.id)
                }
                className="text-slate-400 hover:text-red-500"
                aria-label={`Hapus ${t.title}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
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
