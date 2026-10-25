"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCourses } from "@/modules/courses";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { formatDateTimeLabel, toLocalInput } from "@/shared/lib/date-time";
import { DateTimePicker } from "@/shared/ui/date-time-picker";
import { Field } from "@/shared/ui/field";
import { Modal } from "@/shared/ui/modal";
import { EASE } from "@/shared/ui/motion";
import { inputClass } from "@/shared/ui/styles";
import { useTasks } from "../tasks-context";
import type { Task, TaskPriority } from "../types";

const PRIORITIES: TaskPriority[] = ["Tinggi", "Sedang", "Rendah"];

export function TaskForm({
  task,
  onClose,
}: {
  /** Kosong = tambah baru, ada = ubah. */
  task?: Task;
  onClose: () => void;
}) {
  const { saveTask } = useTasks();
  const { courses } = useCourses();

  const [value, setValue] = useState<Task>(
    task ?? {
      id: `t${Date.now()}`,
      title: "",
      courseId: courses[0]?.id ?? "",
      deadline: toLocalInput(new Date(Date.now() + 864e5)), // besok, jam yang sama
      hours: 1,
      priority: "Sedang",
    },
  );
  // Jam disimpan sebagai teks selama diketik, supaya kolom bisa dikosongkan dulu.
  const [hoursText, setHoursText] = useState(String(value.hours));
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // Desktop: panel tanggal masuk dari kanan. HP: masuk dari atas.
  const panelFrom = isDesktop ? { opacity: 0, x: 24 } : { opacity: 0, y: -8 };

  const set = <K extends keyof Task>(key: K, next: Task[K]) =>
    setValue((prev) => ({ ...prev, [key]: next }));

  function submit() {
    const hours = Number(hoursText);
    if (!value.title.trim()) return setError("Nama tugas wajib diisi.");
    if (!(hours > 0)) return setError("Estimasi jam harus lebih dari 0.");
    saveTask({ ...value, title: value.title.trim(), hours });
    onClose();
  }

  return (
    <Modal
      title={task ? "Ubah tugas" : "Tambah tugas baru"}
      onClose={onClose}
      error={error}
      wide={pickerOpen}
      onSubmit={submit}
    >
      <div className="relative lg:flex">
        {/* ===== KIRI: FORM (lebar tetap di desktop, jadi isinya tidak ikut bergeser) ===== */}
        <div className="space-y-4 lg:w-[400px] lg:shrink-0">
          <Field label="Nama tugas">
            <input
              autoFocus
              className={inputClass}
              value={value.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Contoh: Baca jurnal minggu 4"
            />
          </Field>

          <Field label="Mata kuliah">
            <select
              className={inputClass}
              value={value.courseId}
              onChange={(e) => set("courseId", e.target.value)}
            >
              <option value="">Umum</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Deadline">
            <button
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              className={`${inputClass} flex items-center justify-between text-left ${
                pickerOpen ? "!border-indigo-500" : ""
              }`}
            >
              <span>{formatDateTimeLabel(value.deadline)}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-400"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </button>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimasi (jam)">
              <input
                type="number"
                min={0.5}
                step={0.5}
                className={inputClass}
                value={hoursText}
                onChange={(e) => setHoursText(e.target.value)}
              />
            </Field>
            <Field label="Prioritas">
              <select
                className={inputClass}
                value={value.priority}
                onChange={(e) =>
                  set("priority", e.target.value as TaskPriority)
                }
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* ===== KANAN: TANGGAL (atas) — garis — JAM (bawah) ===== */}
        <AnimatePresence initial={false} mode="popLayout">
          {pickerOpen && (
            <motion.div
              key="deadline-picker"
              initial={panelFrom}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={panelFrom}
              transition={{ duration: 0.25, ease: EASE }}
              className="pt-4 lg:flex lg:w-[329px] lg:shrink-0 lg:pl-5 lg:pt-0"
            >
              <div className="border-t border-slate-200 pt-4 dark:border-slate-700 lg:w-[309px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <DateTimePicker
                  value={value.deadline}
                  onChange={(deadline) => set("deadline", deadline)}
                  onDone={() => setPickerOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
