"use client";
import { useState } from "react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/store";
import { DAYS, toMin } from "@/lib/schedule";
import type { Course } from "@/lib/types";
import { COLORS, SectionTitle } from "@/components/common";
import { CourseForm } from "@/components/forms";

export default function CoursePage() {
  const { data, delCourse } = useData();
  const [form, setForm] = useState<Course | "baru" | null>(null);
  const list = [...data.courses].sort(
    (a, b) =>
      DAYS.indexOf(a.day) - DAYS.indexOf(b.day) ||
      toMin(a.start) - toMin(b.start),
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
        {list.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Belum ada jadwal kuliah.
          </p>
        )}
        {list.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div
              className={cn(
                "grid size-11 place-items-center rounded-xl",
                (COLORS[c.color] ?? COLORS.blue).ico,
              )}
            >
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-48 flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {[c.lecturer, c.room].filter(Boolean).join(" · ") || "-"}
              </p>
            </div>
            <div className="text-sm font-medium">
              {c.day}, {c.start} – {c.end}
            </div>
            <button
              onClick={() => setForm(c)}
              className="text-slate-400 hover:text-slate-700"
              aria-label={`Ubah ${c.name}`}
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={() =>
                confirm(`Hapus jadwal "${c.name}"?`) && delCourse(c.id)
              }
              className="text-slate-400 hover:text-red-500"
              aria-label={`Hapus ${c.name}`}
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
