"use client";
import { useState } from "react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { DAYS, toMinutes } from "@/shared/lib/date-time";
import { SectionTitle } from "@/shared/ui/section-title";
import { card } from "@/shared/ui/styles";
import { colorOf } from "../course-colors";
import { useCourses } from "../courses-provider";
import type { Course } from "../types";
import { CourseForm } from "./course-form";

export function CourseListPage() {
  const { courses, deleteCourse } = useCourses();
  // "baru" = form tambah, Course = form ubah, null = form tertutup
  const [form, setForm] = useState<Course | "baru" | null>(null);

  // Urutkan: hari dulu, lalu jam mulai
  const sorted = [...courses].sort(
    (a, b) =>
      DAYS.indexOf(a.day) - DAYS.indexOf(b.day) ||
      toMinutes(a.start) - toMinutes(b.start),
  );

  return (
    <section>
      <SectionTitle
        eyebrow="Akademik"
        title="Jadwal kuliah"
        action={
          <button
            onClick={() => setForm("baru")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Tambah jadwal
          </button>
        }
      />

      <div className="mt-5 grid gap-3">
        {sorted.length === 0 && (
          <p className={cn(card, "text-center text-sm text-slate-500")}>
            Belum ada jadwal kuliah.
          </p>
        )}

        {sorted.map((course) => (
          <div
            key={course.id}
            className={cn(card, "flex flex-wrap items-center gap-4")}
          >
            <div
              className={cn(
                "grid size-11 place-items-center rounded-xl",
                colorOf(course.color).ico,
              )}
            >
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-48 flex-1">
              <p className="font-semibold">{course.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {[course.lecturer, course.room].filter(Boolean).join(" · ") ||
                  "-"}
              </p>
            </div>
            <div className="text-sm font-medium">
              {course.day}, {course.start} – {course.end}
            </div>
            <button
              onClick={() => setForm(course)}
              className="text-slate-400 hover:text-slate-700"
              aria-label={`Ubah ${course.name}`}
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={() =>
                confirm(`Hapus jadwal "${course.name}"?`) &&
                deleteCourse(course.id)
              }
              className="text-slate-400 hover:text-red-500"
              aria-label={`Hapus ${course.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {form && (
        <CourseForm
          course={form === "baru" ? undefined : form}
          onClose={() => setForm(null)}
        />
      )}
    </section>
  );
}
