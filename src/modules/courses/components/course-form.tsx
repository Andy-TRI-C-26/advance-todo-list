"use client";
import { useState } from "react";
import { DAYS, toMinutes } from "@/shared/lib/date-time";
import { Field } from "@/shared/ui/field";
import { Modal } from "@/shared/ui/modal";
import { inputClass } from "@/shared/ui/styles";
import { TimePicker } from "@/shared/ui/time-picker";
import { useCourses } from "../courses-provider";
import { randomCourseHex, toHexColor } from "../course-colors";
import type { Course } from "../types";

const EARLIEST = 5 * 60; // 05.00
const LATEST = 22 * 60; // 22.00

function newCourse(): Course {
  return {
    id: `c${Date.now()}`,
    name: "",
    day: "Senin",
    start: "08:00",
    end: "09:40",
    room: "",
    lecturer: "",
    color: randomCourseHex(),
  };
}

/** Validasi form. Mengembalikan pesan error, atau "" jika valid. */
function validate(course: Course) {
  if (!course.name.trim()) return "Nama mata kuliah wajib diisi.";
  const start = toMinutes(course.start);
  const end = toMinutes(course.end);
  if (start < EARLIEST || end > LATEST || end <= start)
    return "Jam kuliah harus antara 05.00 dan 22.00, dan jam selesai setelah jam mulai.";
  return "";
}

export function CourseForm({
  course,
  onClose,
}: {
  /** Kosong = tambah baru, ada = ubah. */
  course?: Course;
  onClose: () => void;
}) {
  const { saveCourse } = useCourses();
  const [value, setValue] = useState<Course>(course ?? newCourse());
  const [error, setError] = useState("");
  const set = (key: keyof Course, next: string) =>
    setValue((prev) => ({ ...prev, [key]: next }));

  function submit() {
    const message = validate(value);
    if (message) return setError(message);
    saveCourse({ ...value, name: value.name.trim() });
    onClose();
  }

  return (
    <Modal
      title={course ? "Ubah jadwal kuliah" : "Tambah jadwal kuliah"}
      onClose={onClose}
      error={error}
      onSubmit={submit}
    >
      <Field label="Nama mata kuliah">
        <input
          autoFocus
          className={inputClass}
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Contoh: Pemrograman Web"
        />
      </Field>
      <Field label="Hari">
        <select
          className={inputClass}
          value={value.day}
          onChange={(e) => set("day", e.target.value)}
        >
          {DAYS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mulai">
          <TimePicker
            value={value.start}
            onChange={(time) => set("start", time)}
            ariaLabel="Pilih jam mulai"
          />
        </Field>
        <Field label="Selesai">
          <TimePicker
            value={value.end}
            onChange={(time) => set("end", time)}
            ariaLabel="Pilih jam selesai"
          />
        </Field>
        <Field label="Ruangan">
          <input
            className={inputClass}
            value={value.room}
            onChange={(e) => set("room", e.target.value)}
          />
        </Field>
        <Field label="Warna">
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              aria-label="Pilih warna mata kuliah"
              className="size-10 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-1 dark:border-slate-700"
              value={toHexColor(value.color)}
              onChange={(e) => set("color", e.target.value)}
            />
            <button
              type="button"
              aria-label="Acak warna"
              onClick={() => set("color", randomCourseHex())}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700"
            >
              Acak
            </button>
          </div>
        </Field>
      </div>
      <Field label="Dosen">
        <input
          className={inputClass}
          value={value.lecturer}
          onChange={(e) => set("lecturer", e.target.value)}
        />
      </Field>
    </Modal>
  );
}
