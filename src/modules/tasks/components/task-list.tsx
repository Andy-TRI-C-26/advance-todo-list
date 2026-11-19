"use client";
import { Check, Clock3, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useNow } from "@/shared/hooks/use-now";
import { card } from "@/shared/ui/styles";
import { useCourses } from "@/modules/courses";
import { byDeadline } from "../deadline";
import { useTasks } from "../tasks-context";
import type { Task } from "../types";
import { DeadlineBadge } from "./deadline-badge";
import { EASE } from "@/shared/ui/motion";
import { DeleteConfirmationDialog } from "@/shared/ui/delete-confirmation-dialog";

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
  const { tasks, toggleTask, deleteTask, recordStudySession } = useTasks();
  const { courses } = useCourses();
  const now = useNow();
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);

  const courseName = (id: string) =>
    courses.find((c) => c.id === id)?.name ?? "Umum";

  // Tugas aktif (deadline terdekat dulu), lalu yang sudah selesai
  const active = tasks.filter((t) => !t.completed).sort(byDeadline);
  const done = tasks.filter((t) => t.completed);

  if (tasks.length === 0) {
    return (
      <p className={cn(card, "text-center text-sm text-slate-500 dark:text-slate-400")}>
        Belum ada tugas. Klik &quot;Tambah tugas&quot; untuk memulai.
      </p>
    );
  }

  return (
    <>
      {[...active, ...done].map((task) => (
        <motion.div
          key={task.id}
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.28, ease: EASE }}
          className={cn(
            "flex items-center gap-4 rounded-[16px] border border-slate-200/80 bg-white p-4 shadow-[0_5px_16px_rgba(22,50,79,0.035)] transition-[border-color,box-shadow,opacity] duration-300 hover:border-[#b9d8d3] hover:shadow-[0_10px_22px_rgba(22,50,79,0.07)] dark:border-slate-800 dark:bg-slate-900",
            task.completed && "opacity-60",
          )}
        >
          <button
            onClick={() => toggleTask(task.id)}
            className={cn(
              "grid size-5 shrink-0 place-items-center rounded-md border-2",
              task.completed
                ? "border-primary bg-primary text-white"
                : "border-slate-300 text-transparent dark:border-slate-600",
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
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {courseName(task.courseId)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
              Estimasi {task.hours} jam · prioritas{" "}
              {task.priority.toLowerCase()} ·{" "}
              {new Date(task.deadline).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            {task.tags && task.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {!task.completed && limitedTaskIds?.has(task.id) && (
              <span className="mt-1.5 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                Waktu luang terbatas! Prinsipnya: yang penting selesai daripada
                bagus.
              </span>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                {task.subtasks.filter((item) => item.completed).length}/
                {task.subtasks.length} langkah selesai
              </p>
            )}
            {task.groupMembers && task.groupMembers.length > 0 && (
              <p className="mt-1 text-xs text-violet-500">
                Kelompok: {task.groupMembers.join(", ")}
              </p>
            )}
            {task.internalDeadline && (
              <p className="mt-1 text-xs text-orange-500">
                Deadline internal:{" "}
                {new Date(task.internalDeadline).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>

          {!task.completed && (
            <DeadlineBadge deadline={task.deadline} now={now} />
          )}

          {!task.completed && (
            <button
              onClick={() => recordStudySession(task.id, 25, now.toISOString())}
              className="text-teal-500 hover:text-teal-700 dark:text-teal-400"
              aria-label={`Catat sesi fokus 25 menit untuk ${task.title}`}
              title="Catat 25 menit fokus"
            >
              <Clock3 className="size-4" />
            </button>
          )}

          <button
            onClick={() => onEdit(task)}
            className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label={`Ubah ${task.title}`}
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => setDeleteTaskTarget(task)}
            className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
            aria-label={`Hapus ${task.title}`}
          >
            <Trash2 className="size-4" />
          </button>
        </motion.div>
      ))}
      {deleteTaskTarget && (
        <DeleteConfirmationDialog
          title="Hapus tugas?"
          itemName={deleteTaskTarget.title}
          description="Tugas beserta progresnya akan dihapus dari perangkat. Tindakan ini tidak dapat dibatalkan."
          onClose={() => setDeleteTaskTarget(null)}
          onConfirm={() => {
            deleteTask(deleteTaskTarget.id);
            setDeleteTaskTarget(null);
          }}
        />
      )}
    </>
  );
}
