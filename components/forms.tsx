"use client";
import { useState } from "react";
import { useData } from "@/lib/store";
import { DAYS, deadlineLabel, toLocalInput, toMin } from "@/lib/schedule";
import type { Course, Task } from "@/lib/types";
import { EASE, Field, Modal, inp, useMediaQuery } from "./common";
import DateTimePanel from "./deadlinePicker";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

export function TaskForm({
  task,
  onClose,
}: {
  task?: Task;
  onClose: () => void;
}) {
  const { data, saveTask } = useData();
  const [v, setV] = useState<Task>(
    task ?? {
      id: `t${Date.now()}`,
      title: "",
      courseId: data.courses[0]?.id ?? "",
      deadline: toLocalInput(new Date(Date.now() + 864e5)),
      hours: 1,
      priority: "Sedang",
    },
  );
  const [err, setErr] = useState("");
  const [pick, setPick] = useState(false);
  const isLg = useMediaQuery("(min-width: 1024px)");
  // Desktop: panel masuk dari kanan. HP: panel masuk dari atas.
  const from = isLg ? { opacity: 0, x: 24 } : { opacity: 0, y: -8 };
  const set = <K extends keyof Task>(k: K, x: Task[K]) =>
    setV((p) => ({ ...p, [k]: x }));

  return (
    <Modal
      title={task ? "Ubah tugas" : "Tambah tugas baru"}
      onClose={onClose}
      error={err}
      wide={pick}
      onSubmit={() => {
        if (!v.title.trim()) return setErr("Nama tugas wajib diisi.");
        if (!(v.hours > 0)) return setErr("Estimasi jam harus lebih dari 0.");
        saveTask({ ...v, title: v.title.trim(), hours: Number(v.hours) });
        onClose();
      }}
    >
      <div className="relative lg:flex">
        {/* ===== KIRI: FORM (lebar tetap di desktop, jadi isinya tidak ikut bergeser) ===== */}
        <div className="space-y-4 lg:w-[400px] lg:shrink-0">
          <Field label="Nama tugas">
            <input
              autoFocus
              className={inp}
              value={v.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Contoh: Baca jurnal minggu 4"
            />
          </Field>
          <Field label="Mata kuliah">
            <select
              className={inp}
              value={v.courseId}
              onChange={(e) => set("courseId", e.target.value)}
            >
              <option value="">Umum</option>
              {data.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <button
              type="button"
              onClick={() => setPick((o) => !o)}
              className={`${inp} flex items-center justify-between text-left ${
                pick ? "!border-indigo-500" : ""
              }`}
            >
              <span>{deadlineLabel(v.deadline)}</span>
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
                className={inp}
                value={v.hours}
                onChange={(e) =>
                  set("hours", e.target.value as unknown as number)
                }
              />
            </Field>
            <Field label="Prioritas">
              <select
                className={inp}
                value={v.priority}
                onChange={(e) =>
                  set("priority", e.target.value as Task["priority"])
                }
              >
                {["Tinggi", "Sedang", "Rendah"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* ===== KANAN: TANGGAL (atas) — garis — JAM (bawah) ===== */}
        <AnimatePresence initial={false} mode="popLayout">
          {pick && (
            <motion.div
              key="deadline-picker"
              initial={from}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={from}
              transition={{ duration: 0.25, ease: EASE }}
              className="pt-4 lg:flex lg:w-[329px] lg:shrink-0 lg:pl-5 lg:pt-0"
            >
              <div className="border-t border-slate-200 pt-4 dark:border-slate-700 lg:w-[309px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <DateTimePanel
                  value={v.deadline}
                  onChange={(x) => set("deadline", x)}
                  onDone={() => setPick(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

export function CourseForm({
  course,
  onClose,
}: {
  course?: Course;
  onClose: () => void;
}) {
  const { saveCourse } = useData();
  const [v, setV] = useState<Course>(
    course ?? {
      id: `c${Date.now()}`,
      name: "",
      day: "Senin",
      start: "08:00",
      end: "09:40",
      room: "",
      lecturer: "",
      color: "blue",
    },
  );
  const [err, setErr] = useState("");
  const set = (k: keyof Course, x: string) => setV((p) => ({ ...p, [k]: x }));
  return (
    <Modal
      title={course ? "Ubah jadwal kuliah" : "Tambah jadwal kuliah"}
      onClose={onClose}
      error={err}
      onSubmit={() => {
        if (!v.name.trim()) return setErr("Nama mata kuliah wajib diisi.");
        if (
          toMin(v.start) < 300 ||
          toMin(v.end) > 1320 ||
          toMin(v.end) <= toMin(v.start)
        )
          return setErr(
            "Jam kuliah harus antara 05.00 dan 22.00, dan jam selesai setelah jam mulai.",
          );
        saveCourse({ ...v, name: v.name.trim() });
        onClose();
      }}
    >
      <Field label="Nama mata kuliah">
        <input
          autoFocus
          className={inp}
          value={v.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Contoh: Pemrograman Web"
        />
      </Field>
      <Field label="Hari">
        <select
          className={inp}
          value={v.day}
          onChange={(e) => set("day", e.target.value)}
        >
          {DAYS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mulai">
          <input
            type="time"
            className={inp}
            value={v.start}
            onChange={(e) => set("start", e.target.value)}
          />
        </Field>
        <Field label="Selesai">
          <input
            type="time"
            className={inp}
            value={v.end}
            onChange={(e) => set("end", e.target.value)}
          />
        </Field>
        <Field label="Ruangan">
          <input
            className={inp}
            value={v.room}
            onChange={(e) => set("room", e.target.value)}
          />
        </Field>
        <Field label="Warna">
          <select
            className={inp}
            value={v.color}
            onChange={(e) => set("color", e.target.value)}
          >
            <option value="blue">Indigo</option>
            <option value="violet">Violet</option>
            <option value="rose">Mawar</option>
            <option value="amber">Amber</option>
          </select>
        </Field>
      </div>
      <Field label="Dosen">
        <input
          className={inp}
          value={v.lecturer}
          onChange={(e) => set("lecturer", e.target.value)}
        />
      </Field>
    </Modal>
  );
}
