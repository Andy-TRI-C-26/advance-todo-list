"use client";
import { useEffect, useState } from "react";
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
import { TagPicker } from "./tag-picker";
import type { Task, TaskPriority } from "../types";

const PRIORITIES: TaskPriority[] = ["Tinggi", "Sedang", "Rendah"];
const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function getNextDay(dayName: string) {
  const targetDay = DAYS.indexOf(dayName);
  if (targetDay === -1) return null;
  const now = new Date();
  const result = new Date(now);
  let diff = targetDay - now.getDay();
  if (diff <= 0) diff += 7; // Cari hari di pekan depan jika hari ini atau sudah lewat
  result.setDate(now.getDate() + diff);
  result.setHours(23, 0, 0, 0);
  return result;
}

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

  const [value, setValue] = useState<Task>(() => {
    if (task) return task;

    const course = courses[0];
    let deadline = new Date();
    deadline.setDate(deadline.getDate() + 1); // Default besok
    deadline.setHours(23, 0, 0, 0);

    // Jika ada mata kuliah, coba gunakan hari kuliah terdekat
    if (course) {
      const nextClass = getNextDay(course.day);
      if (nextClass) deadline = nextClass;
    }

    return {
      id: `t${Date.now()}`,
      title: "",
      courseId: course?.id ?? "",
      deadline: toLocalInput(deadline),
      hours: 1,
      priority: "Sedang",
    };
  });


  // Jam disimpan sebagai teks selama diketik, supaya kolom bisa dikosongkan dulu.
  const [hoursText, setHoursText] = useState(String(value.hours));
  const [membersText, setMembersText] = useState(
    (value.groupMembers ?? []).join(", "),
  );
  const [subtasksText, setSubtasksText] = useState(
    (value.subtasks ?? []).map((item) => item.title).join("\n"),
  );
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // Desktop: panel tanggal masuk dari kanan. HP: masuk dari atas.
  const panelFrom = isDesktop ? { opacity: 0, x: 24 } : { opacity: 0, y: -8 };

  useEffect(() => {
    if (task) return;
    const course = courses.find((c) => c.id === value.courseId);
    if (course) {
      const nextClass = getNextDay(course.day);
      if (nextClass) set("deadline", toLocalInput(nextClass));
    }
  }, [value.courseId, courses, task]);

  const set = <K extends keyof Task>(key: K, next: Task[K]) =>
    setValue((prev) => ({ ...prev, [key]: next }));

  function submit() {
    const hours = Number(hoursText);
    if (!value.title.trim()) return setError("Nama tugas wajib diisi.");
    if (!(hours > 0)) return setError("Estimasi jam harus lebih dari 0.");
    const subtasks = subtasksText
      .split("\n")
      .map((title, index) => ({
        id: value.subtasks?.[index]?.id ?? `${value.id}-subtask-${index}`,
        title: title.trim(),
        completed: value.subtasks?.[index]?.completed ?? false,
      }))
      .filter((item) => item.title);
    const groupMembers = membersText
      .split(",")
      .map((member) => member.trim())
      .filter(Boolean);
    saveTask({
      ...value,
      title: value.title.trim(),
      hours,
      progress: Math.min(100, Math.max(0, value.progress ?? 0)),
      subtasks,
      groupMembers,
    });
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

          <div className="grid grid-cols-2 gap-3">
            <Field label="Energi yang dibutuhkan">
              <select
                className={inputClass}
                value={value.energy ?? "Sedang"}
                onChange={(e) =>
                  set("energy", e.target.value as Task["energy"])
                }
              >
                <option>Tinggi</option>
                <option>Sedang</option>
                <option>Rendah</option>
              </select>
            </Field>
            <Field label="Progres (%)">
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={value.progress ?? 0}
                onChange={(e) => set("progress", Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label="Langkah kecil (satu per baris)">
            <textarea
              className={`${inputClass} min-h-20`}
              value={subtasksText}
              onChange={(e) => setSubtasksText(e.target.value)}
              placeholder="Contoh: Cari referensi jurnal&#10;Tulis analisis"
            />
          </Field>

          <Field label="Anggota kelompok (pisahkan dengan koma)">
            <input
              className={inputClass}
              value={membersText}
              onChange={(e) => setMembersText(e.target.value)}
              placeholder="Nama anggota 1, Nama anggota 2"
            />
          </Field>

          <Field label="Deadline internal kelompok (opsional)">
            <input
              type="datetime-local"
              className={inputClass}
              value={value.internalDeadline ?? ""}
              onChange={(e) => set("internalDeadline", e.target.value || undefined)}
            />
          </Field>

          <TagPicker
            value={value.tags ?? []}
            onChange={(tags) => set("tags", tags)}
          />
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
