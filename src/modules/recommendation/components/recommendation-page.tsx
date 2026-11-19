"use client";
import { useState } from "react";
import { BrainCircuit, CalendarPlus, Check, Sparkles } from "lucide-react";
import { useNow } from "@/shared/hooks/use-now";
import { SectionTitle } from "@/shared/ui/section-title";
import { useCourses } from "@/modules/courses";
import { useSettings } from "@/modules/settings";
import { byDeadline, useTasks } from "@/modules/tasks";
import { buildPayload } from "../build-payload";
import { getTaskRecommendation } from "../server/get-task-recommendation";
import type { Recommendation } from "../types";

export function RecommendationPage() {
  const { tasks, saveTask } = useTasks();
  const { courses } = useCourses();
  const { settings } = useSettings();
  const now = useNow();

  const activeTasks = tasks.filter((t) => !t.completed).sort(byDeadline);

  const [selectedId, setSelectedId] = useState(activeTasks[0]?.id ?? "");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  async function recommend() {
    const selected = activeTasks.find((t) => t.id === selectedId);
    if (!selected) return;

    setLoading(true);
    setError("");
    setRecommendation(null);
    setApplied(false);
    try {
      const payload = buildPayload({
        selected,
        activeTasks,
        courses,
        settings,
        now,
      });
      setRecommendation(await getTaskRecommendation(payload));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Rekomendasi gagal dibuat.",
      );
    } finally {
      setLoading(false);
    }

  }

  function applyRecommendation() {
    const selected = activeTasks.find((task) => task.id === selectedId);
    if (!selected || !recommendation) return;
    saveTask({
      ...selected,
      plannedStart: recommendation.start,
      plannedEnd: recommendation.end,
    });
    setApplied(true);
  }

  return (
    <section className="max-w-3xl">
      <SectionTitle
        eyebrow="Asisten belajar"
        title="Rekomendasi waktu terbaik"
      />
      <div className="mt-5 rounded-2xl border border-indigo-200 bg-linear-to-br from-indigo-50 to-violet-50 p-6 dark:border-indigo-900 dark:from-indigo-950/50 dark:to-violet-950/40">
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <BrainCircuit className="size-5" />
          </div>
          <div>
            <h3 className="font-bold">Biar AI bantu atur fokusmu</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Pilih satu tugas. AI akan mempertimbangkan deadline, jadwal
              kuliah, dan jam tidurmu sebelum memberi slot yang realistis.
            </p>
          </div>
        </div>
        <label className="mt-6 block text-sm font-semibold">
          Tugas yang ingin dijadwalkan
          <select
            data-tour="recommendation-select"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900"
          >
            {activeTasks.length ? (
              activeTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} · deadline{" "}
                  {new Date(task.deadline).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </option>
              ))
            ) : (
              <option value="">Semua tugas selesai</option>
            )}
          </select>
        </label>
        <button
          data-tour="recommendation-action"
          onClick={recommend}
          disabled={!selectedId || loading}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="size-4" />
          {loading ? "Menganalisis jadwal..." : "Buat rekomendasi"}
        </button>
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}
      </div>
      <div
        data-tour="recommendation-result"
        className={recommendation ? "mt-4" : "mt-4"}
      >
      {recommendation ? (
        <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-sm dark:border-teal-900 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
            Hasil rekomendasi
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {new Date(recommendation.start).toLocaleString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            –{" "}
            {new Date(recommendation.end).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {recommendation.alasan}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Slot ini tetap berada di luar jam kuliah dan jam tidur 22.00–05.00.
          </p>
          <button
            onClick={applyRecommendation}
            disabled={applied}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {applied ? <Check className="size-4" /> : <CalendarPlus className="size-4" />}
            {applied ? "Sudah ditambahkan ke jadwal" : "Tambahkan ke jadwal"}
          </button>
          {recommendation.langkah.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-sm font-bold">Langkah fokus yang disarankan</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                {recommendation.langkah.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-5 py-4 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500">
          Hasil rekomendasi akan ditampilkan di area ini.
        </div>
      )}
      </div>
    </section>
  );
}
