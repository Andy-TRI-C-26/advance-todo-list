"use client";
import { Check, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useNow } from "@/shared/hooks/use-now";
import { card } from "@/shared/ui/styles";
import { useCourses } from "@/modules/courses";
import { byDeadline } from "../deadline";
import { useTasks } from "../tasks-context";
import type { Task } from "../types";
import { DeadlineBadge } from "./deadline-badge";

type TaskListProps = {
  onEdit: (task: Task) => void;
  /**
   * Id tugas yang waktu luangnya tidak cukup.
   * Informasi ini dihitung modul `scheduling`; modul ini cukup menerimanya
   * lewat props, sehingga `tasks` tidak perlu mengimpor `scheduling`.
   */
  limitedTaskIds?: ReadonlySet<string>;
};

export function TaskList({ onEdit, limitedTaskIds }: TaskListProps) {
  const { tasks, toggleTask, deleteTask } = useTasks();
  const { courses } = useCourses();
  const now = useNow();

  const courseName = (id: string) =>
    courses.find((c) => c.id === id)?.name ?? "Umum";

  // Tugas aktif (deadline terdekat dulu), lalu yang sudah selesai
  const active = tasks.filter((t) => !t.completed).sort(byDeadline);
  const done = tasks.filter((t) => t.completed);

  if (tasks.length === 0) {
    return (
      <p className={cn(card, "text-center text-sm text-slate-500")}>
        Belum ada tugas. Klik &quot;Tambah tugas&quot; untuk memulai.
      </p>
    );
  }

  return (
    <>
      {[...active, ...done].map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition dark:border-slate-800 dark:bg-slate-900",
            task.completed && "opacity-60",
          )}
        >
          <button
            onClick={() => toggleTask(task.id)}
            className={cn(
              "grid size-5 shrink-0 place-items-center rounded-md border-2",
              task.completed
                ? "border-primary bg-primary text-white"
                : "border-slate-300 text-transparent",
            )}
            aria-label={
              task.completed
                ? `Batalkan selesai ${task.title}`
                : `Tandai selesai ${task.title}`
            }
          >
            {task.completed && <Check className="size-3" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={cn(
                  "truncate text-sm font-semibold",
                  task.completed && "line-through",
                )}
              >
                {task.title}
              </p>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800">
                {courseName(task.courseId)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Estimasi {task.hours} jam · prioritas{" "}
              {task.priority.toLowerCase()} ·{" "}
              {new Date(task.deadline).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            {!task.completed && limitedTaskIds?.has(task.id) && (
              <span className="mt-1.5 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                Waktu luang terbatas! Prinsipnya: yang penting selesai daripada
                bagus.
              </span>
            )}
          </div>

          {!task.completed && (
            <DeadlineBadge deadline={task.deadline} now={now} />
          )}

          <button
            onClick={() => onEdit(task)}
            className="text-slate-400 hover:text-slate-700"
            aria-label={`Ubah ${task.title}`}
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() =>
              confirm(`Hapus tugas "${task.title}"?`) && deleteTask(task.id)
            }
            className="text-slate-400 hover:text-red-500"
            aria-label={`Hapus ${task.title}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
    </>
  );
}
