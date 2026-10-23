"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Cloud,
  CloudUpload,
  FileText,
  LayoutDashboard,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  GraduationCap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTaskRecommendation } from "./actions/recommendation";

type Task = {
  id: string;
  title: string;
  course: string;
  deadline: string;
  hours: number;
  priority: "Tinggi" | "Sedang";
  completed?: boolean;
};
type Course = {
  id: string;
  name: string;
  day: string;
  start: string;
  end: string;
  room: string;
  lecturer: string;
  color: string;
};

const initialTasks: Task[] = [
  {
    id: "t1",
    title: "Proposal Penelitian",
    course: "Metodologi Penelitian",
    deadline: "2026-10-22T23:59:00",
    hours: 3,
    priority: "Tinggi",
  },
  {
    id: "t2",
    title: "Latihan Soal Turunan",
    course: "Kalkulus II",
    deadline: "2026-10-24T18:00:00",
    hours: 2,
    priority: "Tinggi",
  },
  {
    id: "t3",
    title: "Rangkuman Bab 4",
    course: "Sistem Operasi",
    deadline: "2026-10-27T23:59:00",
    hours: 1.5,
    priority: "Sedang",
  },
  {
    id: "t4",
    title: "Presentasi Kelompok",
    course: "Manajemen Bisnis",
    deadline: "2026-10-30T09:00:00",
    hours: 2,
    priority: "Sedang",
  },
];
const initialCourses: Course[] = [
  {
    id: "c1",
    name: "Kalkulus II",
    day: "Senin",
    start: "08:00",
    end: "10:30",
    room: "Lab 201",
    lecturer: "Dr. Budi Santoso",
    color: "blue",
  },
  {
    id: "c2",
    name: "Sistem Operasi",
    day: "Selasa",
    start: "10:00",
    end: "12:30",
    room: "R. 304",
    lecturer: "Prof. Sari Wijaya",
    color: "violet",
  },
  {
    id: "c3",
    name: "Metodologi Penelitian",
    day: "Rabu",
    start: "13:00",
    end: "15:30",
    room: "R. 204",
    lecturer: "Dr. Andi Pratama",
    color: "rose",
  },
  {
    id: "c4",
    name: "Manajemen Bisnis",
    day: "Kamis",
    start: "08:00",
    end: "10:30",
    room: "R. 105",
    lecturer: "Dra. Maya Putri",
    color: "amber",
  },
];
const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const hours = Array.from({ length: 18 }, (_, i) => i + 5);

function AppLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-5" />
      </div>
      <span className="text-xl font-bold tracking-tight">
        nugas<span className="text-primary">.in</span>
      </span>
    </div>
  );
}
function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}
function DeadlineBadge({ deadline }: { deadline: string }) {
  const diff = Math.ceil(
    (new Date(deadline).getTime() - new Date("2026-10-21T09:00:00").getTime()) /
      86400000,
  );
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        diff <= 1
          ? "bg-red-100 text-red-700"
          : diff <= 3
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700",
      )}
    >
      {diff <= 1 ? "H-1" : `H-${diff}`}
    </span>
  );
}

export default function Page() {
  const [active, setActive] = useState("Dashboard");
  const [tasks, setTasks] = useState(initialTasks);
  const [courses, setCourses] = useState(initialCourses);
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    waktu: string;
    alasan: string;
  } | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");
  const completed = tasks.filter((t) => t.completed).length;
  const totalHours = useMemo(
    () => tasks.filter((t) => !t.completed).reduce((s, t) => s + t.hours, 0),
    [tasks],
  );

  function addTask() {
    if (!taskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: `t${Date.now()}`,
        title: taskTitle,
        course: "Tugas baru",
        deadline: "2026-10-28T23:59:00",
        hours: 1,
        priority: "Sedang",
      },
    ]);
    setTaskTitle("");
    setShowTaskForm(false);
  }
  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }
  function backup() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-[#f6f7fb] text-slate-950",
        dark && "dark bg-slate-950 text-slate-50",
      )}
    >
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-10 flex items-center justify-between px-2">
          <AppLogo />
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          >
            <X />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5">
          {[
            ["Dashboard", LayoutDashboard],
            ["Rekomendasi AI", BrainCircuit],
            ["Jadwal Kuliah", CalendarDays],
            ["Pengaturan", Settings],
          ].map(([label, Icon]) => (
            <button
              key={label as string}
              onClick={() => {
                setActive(label as string);
                setMobileOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-colors",
                active === label
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800",
              )}
            >
              <Icon className="size-[18px]" />
              {label as string}
            </button>
          ))}
        </nav>
        <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
          <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900">
            <Sparkles className="size-4" />
          </div>
          <p className="text-sm font-semibold">Fokus minggu ini</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Kamu punya {totalHours} jam tugas yang perlu diselesaikan.
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900">
            <div className="h-full w-[62%] rounded-full bg-indigo-500" />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            62% waktu teralokasi
          </p>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
            AR
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Alya Rahma</p>
            <p className="truncate text-xs text-slate-400">Mahasiswa aktif</p>
          </div>
          <MoreHorizontal className="size-4 text-slate-400" />
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Tutup navigasi"
        />
      )}
      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/80 bg-[#f6f7fb]/90 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              <Menu />
            </button>
            <div>
              <p className="text-sm text-slate-500">Selamat pagi, Alya</p>
              <h1 className="text-lg font-bold">{active}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 sm:grid dark:border-slate-800 dark:bg-slate-900">
              <Search className="size-[18px]" />
            </button>
            <button
              onClick={() => setDark(!dark)}
              className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900"
              aria-label="Ganti tema"
            >
              {dark ? (
                <Sun className="size-[18px]" />
              ) : (
                <Moon className="size-[18px]" />
              )}
            </button>
            <button
              className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900"
              aria-label="Notifikasi"
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-500">
                Selasa, 21 Oktober 2026
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                Rencanakan harimu.
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Biar nugas lebih terarah, tanpa mengorbankan waktu istirahat.
              </p>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Plus className="size-4" /> Tambah tugas
            </button>
          </div>
          {active === "Dashboard" && (
            <>
              <section className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Tugas aktif</span>
                    <div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                      <FileText className="size-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">
                    {tasks.length - completed}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {completed} tugas selesai minggu ini
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Waktu teralokasi
                    </span>
                    <div className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950">
                      <Clock3 className="size-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">
                    {totalHours}{" "}
                    <span className="text-sm font-medium text-slate-400">
                      jam
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    dari 42 jam waktu luang
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Keseimbangan</span>
                    <div className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                      <Sparkles className="size-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">Baik</p>
                  <p className="mt-1 text-xs text-emerald-600">
                    Jadwal tidur tetap aman
                  </p>
                </div>
              </section>
              <section className="mb-8">
                <SectionTitle
                  eyebrow="Prioritas"
                  title="Tugas yang perlu diperhatikan"
                  action={
                    <div className="hidden items-center gap-2 sm:flex">
                      <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900">
                        Deadline terdekat{" "}
                        <ChevronDown className="ml-1 inline size-3" />
                      </button>
                    </div>
                  }
                />
                <div className="mt-4 grid gap-3">
                  {tasks.slice(0, 3).map((task) => (
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
                        aria-label={`Tandai ${task.title}`}
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
                            {task.course}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Estimasi {task.hours} jam · {task.priority} prioritas
                        </p>
                      </div>
                      <DeadlineBadge deadline={task.deadline} />
                      <button
                        className="text-slate-400 hover:text-slate-700"
                        aria-label="Opsi tugas"
                      >
                        <MoreHorizontal className="size-4" />
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
                    <div className="flex items-center gap-2">
                      <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
                        <span className="size-2 rounded-full bg-indigo-500" />{" "}
                        Kuliah{" "}
                        <span className="ml-2 size-2 rounded-full bg-teal-400" />{" "}
                        Waktu nugas
                      </span>
                      <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900">
                        Minggu ini{" "}
                        <ChevronDown className="ml-1 inline size-3" />
                      </button>
                    </div>
                  }
                />
                <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="min-w-[700px]">
                    <div className="grid grid-cols-[58px_repeat(7,1fr)] border-b border-slate-100 dark:border-slate-800">
                      <div />
                      <div className="px-2 py-3 text-center text-[11px] font-semibold text-slate-400">
                        {days.map((d) => (
                          <span key={d} className="inline-block w-[14.28%]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="relative grid grid-cols-[58px_repeat(7,1fr)]">
                      <div className="flex flex-col">
                        {hours.map((h) => (
                          <div
                            key={h}
                            className="h-10 border-b border-slate-100 pr-2 pt-1 text-right text-[10px] text-slate-400 dark:border-slate-800"
                          >{`${String(h).padStart(2, "0")}:00`}</div>
                        ))}
                      </div>
                      <div className="relative col-span-7 grid grid-cols-7">
                        {days.map((day, i) => (
                          <div
                            key={day}
                            className="relative border-l border-slate-100 dark:border-slate-800"
                          >
                            {hours.map((h) => (
                              <div
                                key={h}
                                className="h-10 border-b border-slate-100 dark:border-slate-800"
                              />
                            ))}
                            {i === 0 && (
                              <div className="absolute inset-x-1 top-12 h-20 rounded-lg border-l-4 border-indigo-500 bg-indigo-100 p-2 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
                                Kalkulus II
                                <br />
                                <span className="font-normal">
                                  08:00 – 10:30
                                </span>
                              </div>
                            )}
                            {i === 1 && (
                              <div className="absolute inset-x-1 top-20 h-20 rounded-lg border-l-4 border-violet-500 bg-violet-100 p-2 text-[10px] font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-200">
                                Sistem Operasi
                                <br />
                                <span className="font-normal">
                                  10:00 – 12:30
                                </span>
                              </div>
                            )}
                            {i === 2 && (
                              <>
                                <div className="absolute inset-x-1 top-32 h-20 rounded-lg border-l-4 border-rose-500 bg-rose-100 p-2 text-[10px] font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-200">
                                  Metodologi
                                  <br />
                                  <span className="font-normal">
                                    13:00 – 15:30
                                  </span>
                                </div>
                                <div className="absolute inset-x-1 top-4 h-8 rounded-lg border border-dashed border-teal-500 bg-teal-50/80 p-1.5 text-[9px] font-semibold text-teal-700 dark:bg-teal-950/70 dark:text-teal-200">
                                  Proposal · 1j
                                </div>
                              </>
                            )}
                            {i === 4 && (
                              <div className="absolute inset-x-1 top-4 h-12 rounded-lg border border-dashed border-teal-500 bg-teal-50/80 p-1.5 text-[9px] font-semibold text-teal-700 dark:bg-teal-950/70 dark:text-teal-200">
                                Latihan soal · 2j
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
          {active === "Rekomendasi AI" && (
            <RecommendationPage
              tasks={tasks}
              courses={courses}
              recommendation={recommendation}
              setRecommendation={setRecommendation}
              loading={recommendationLoading}
              setLoading={setRecommendationLoading}
              error={recommendationError}
              setError={setRecommendationError}
            />
          )}
          {active === "Jadwal Kuliah" && (
            <CoursePage courses={courses} setCourses={setCourses} />
          )}
          {active === "Pengaturan" && (
            <SettingsPage saved={saved} backup={backup} />
          )}
        </div>
      </main>
      {showTaskForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Tambah tugas baru</h2>
                <p className="text-sm text-slate-500">
                  Masukkan detail tugasmu.
                </p>
              </div>
              <button onClick={() => setShowTaskForm(false)} aria-label="Tutup">
                <X className="size-5 text-slate-400" />
              </button>
            </div>
            <label className="text-sm font-medium">
              Nama tugas
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.nativeEvent.isComposing &&
                    e.keyCode !== 229
                  )
                    addTask();
                }}
                placeholder="Contoh: Baca jurnal minggu 4"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
            <button
              onClick={addTask}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Simpan tugas
            </button>
          </div>
        </div>
      )}
      {saved && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <Check className="size-4 text-emerald-400" /> Data berhasil
          dicadangkan secara lokal
        </div>
      )}
    </div>
  );
}

function RecommendationPage({
  tasks,
  courses,
  recommendation,
  setRecommendation,
  loading,
  setLoading,
  error,
  setError,
}: {
  tasks: Task[];
  courses: Course[];
  recommendation: { waktu: string; alasan: string } | null;
  setRecommendation: React.Dispatch<
    React.SetStateAction<{ waktu: string; alasan: string } | null>
  >;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}) {
  const activeTasks = tasks.filter((task) => !task.completed);
  const [selectedId, setSelectedId] = useState(activeTasks[0]?.id ?? "");
  async function recommend() {
    const selected = activeTasks.find((task) => task.id === selectedId);
    if (!selected) return;
    setLoading(true);
    setError("");
    setRecommendation(null);
    try {
      const result = await getTaskRecommendation({
        selectedTask: {
          title: selected.title,
          course: selected.course,
          deadline: selected.deadline,
          hours: selected.hours,
        },
        otherTasks: activeTasks
          .filter((task) => task.id !== selected.id)
          .map((task) => ({
            title: task.title,
            deadline: task.deadline,
            hours: task.hours,
            completed: task.completed,
          })),
        courses: courses.map((course) => ({
          name: course.name,
          day: course.day,
          start: course.start,
          end: course.end,
        })),
        constraints: {
          sleepStart: "22:00",
          sleepEnd: "05:00",
          operatingStart: "05:00",
          operatingEnd: "22:00",
        },
      });
      setRecommendation(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Rekomendasi gagal dibuat.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="max-w-3xl">
      <SectionTitle
        eyebrow="Asisten belajar"
        title="Rekomendasi waktu terbaik"
      />
      <div className="mt-5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:border-indigo-900 dark:from-indigo-950/50 dark:to-violet-950/40">
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
      {recommendation && (
        <div className="mt-4 rounded-2xl border border-teal-200 bg-white p-6 shadow-sm dark:border-teal-900 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
            Hasil rekomendasi
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {recommendation.waktu}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {recommendation.alasan}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Slot ini tetap berada di luar jam kuliah dan jam tidur 22.00–05.00.
          </p>
        </div>
      )}
    </section>
  );
}

function CoursePage({
  courses,
  setCourses,
}: {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  return (
    <section>
      <SectionTitle
        eyebrow="Akademik"
        title="Jadwal kuliah"
        action={
          <button
            onClick={() => setShow(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Tambah jadwal
          </button>
        }
      />
      <div className="mt-5 grid gap-3">
        {courses.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div
              className={cn(
                "grid size-11 place-items-center rounded-xl",
                c.color === "blue"
                  ? "bg-indigo-100 text-indigo-600"
                  : c.color === "violet"
                    ? "bg-violet-100 text-violet-600"
                    : c.color === "rose"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-amber-100 text-amber-600",
              )}
            >
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-48 flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {c.lecturer} · {c.room}
              </p>
            </div>
            <div className="text-sm font-medium">
              {c.day}, {c.start} – {c.end}
            </div>
            <button
              onClick={() =>
                setCourses((prev) => prev.filter((x) => x.id !== c.id))
              }
              className="text-slate-400 hover:text-red-500"
              aria-label={`Hapus ${c.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Tambah jadwal kuliah</h2>
              <button onClick={() => setShow(false)}>
                <X className="size-5 text-slate-400" />
              </button>
            </div>
            <label className="text-sm font-medium">
              Nama mata kuliah
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                placeholder="Contoh: Pemrograman Web"
              />
            </label>
            <button
              onClick={() => {
                if (name.trim())
                  setCourses((prev) => [
                    ...prev,
                    {
                      id: `c${Date.now()}`,
                      name,
                      day: "Jumat",
                      start: "13:00",
                      end: "15:00",
                      room: "R. 101",
                      lecturer: "Dosen baru",
                      color: "blue",
                    },
                  ]);
                setShow(false);
                setName("");
              }}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Simpan jadwal
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
function SettingsPage({
  saved,
  backup,
}: {
  saved: boolean;
  backup: () => void;
}) {
  return (
    <section className="max-w-3xl">
      <SectionTitle eyebrow="Preferensi" title="Pengaturan & penyimpanan" />
      <div className="mt-5 flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Cloud className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Penyimpanan lokal</p>
              <p className="mt-1 text-sm text-slate-500">
                Data tersimpan otomatis di perangkatmu dan bisa diakses secara
                offline.
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Aktif
                · Offline mode
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <CloudUpload className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Backup & sinkronisasi</p>
              <p className="mt-1 text-sm text-slate-500">
                Simpan salinan nugas.in ke Google Drive untuk memulihkan data di
                perangkat lain.
              </p>
              <button
                onClick={backup}
                className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Hubungkan & simpan ke Google Drive
              </button>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Moon className="size-4" /> Jam tidur wajib
          </p>
          <p className="mt-2 text-sm text-amber-800/80 dark:text-amber-200/70">
            Auto-scheduler tidak akan mengalokasikan tugas pada pukul{" "}
            <strong>22.00 – 05.00</strong>. Istirahat yang cukup tetap menjadi
            prioritas.
          </p>
        </div>
      </div>
    </section>
  );
}
