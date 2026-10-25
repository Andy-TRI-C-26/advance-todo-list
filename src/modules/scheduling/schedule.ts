// Algoritma penjadwalan: Earliest Deadline First (EDF).
//
// Ide singkat:
//   1. Untuk 14 hari ke depan, hitung "waktu kosong" = jam operasional
//      (di luar jam tidur) dikurangi jam kuliah.
//   2. Urutkan tugas dari deadline terdekat.
//   3. Isi tiap tugas ke waktu kosong paling awal, tetapi tidak melewati deadline.
//
// File ini PURE: tidak memakai React, localStorage, atau modul lain.
// Karena itu mudah dipahami dan mudah diuji sendirian.

import { DAYS, toMinutes } from "@/shared/lib/date-time";
import type { SchedulePlan, Slot } from "./types";

// Hanya bagian yang dibutuhkan algoritma. Tipe `Task` dan `Course` milik
// modul lain otomatis cocok dengan bentuk ini (structural typing).
export type SchedulableTask = {
  id: string;
  deadline: string;
  hours: number;
  completed?: boolean;
};
export type BusyBlock = { day: string; start: string; end: string };

export type ScheduleInput = {
  tasks: SchedulableTask[];
  courses: BusyBlock[];
  sleepStart: string; // "22:00" = batas akhir hari kerja
  sleepEnd: string; // "05:00" = batas awal hari kerja
  now: Date;
};

const DAYS_TO_PLAN = 14;
const DAYS_IN_STATS = 7;
const SNAP_MINUTES = 15;
const MS_PER_MINUTE = 60_000;

/** Nama hari menurut urutan Date.getDay() (0 = Minggu). */
const JS_DAY_NAMES = ["Minggu", ...DAYS.slice(0, 6)];

/** Rentang waktu kosong, dalam menit sejak 00:00. */
type FreeWindow = { start: number; end: number };

type PlanDay = {
  midnight: number; // timestamp (ms) pukul 00:00 hari itu
  windows: FreeWindow[];
};

/** Potong waktu sibuk (mis. kuliah) dari daftar waktu kosong. */
function subtractBusy(
  windows: FreeWindow[],
  busyStart: number,
  busyEnd: number,
): FreeWindow[] {
  return windows
    .flatMap((w) => {
      const noOverlap = busyEnd <= w.start || busyStart >= w.end;
      if (noOverlap) return [w];
      return [
        { start: w.start, end: Math.min(busyStart, w.end) }, // sebelum kuliah
        { start: Math.max(busyEnd, w.start), end: w.end }, // sesudah kuliah
      ];
    })
    .filter((w) => w.end > w.start);
}

/** Waktu kosong pada satu hari (offset 0 = hari ini). */
function buildDay(input: ScheduleInput, offset: number): PlanDay {
  const { courses, sleepStart, sleepEnd, now } = input;
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + offset,
  );
  const opens = toMinutes(sleepEnd);
  const closes = toMinutes(sleepStart);

  // Hari ini: jangan jadwalkan di masa lalu. Mulai dari kelipatan 15 menit berikutnya.
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const start =
    offset === 0
      ? Math.max(opens, Math.ceil(minutesNow / SNAP_MINUTES) * SNAP_MINUTES)
      : opens;

  let windows: FreeWindow[] = [{ start, end: closes }];
  const dayName = JS_DAY_NAMES[date.getDay()];
  for (const course of courses.filter((c) => c.day === dayName)) {
    windows = subtractBusy(
      windows,
      toMinutes(course.start),
      toMinutes(course.end),
    );
  }
  return { midnight: date.getTime(), windows };
}

/**
 * Isi satu tugas ke waktu kosong paling awal.
 * PERHATIAN: fungsi ini mengubah `days` (waktu yang terpakai dikurangi),
 * sehingga tugas berikutnya hanya melihat sisa waktu.
 * Mengembalikan menit yang tidak sempat dijadwalkan (0 = beres).
 */
function allocate(task: SchedulableTask, days: PlanDay[], slots: Slot[]) {
  let remaining = task.hours * 60;
  const deadline = new Date(task.deadline).getTime();

  for (const day of days) {
    for (const window of day.windows) {
      if (remaining <= 0) return 0;

      // Jangan melewati deadline
      const minutesUntilDeadline = Math.floor(
        (deadline - day.midnight) / MS_PER_MINUTE,
      );
      const end = Math.min(window.end, minutesUntilDeadline);
      if (end - window.start <= 0) continue;

      const used = Math.min(remaining, end - window.start);
      slots.push({
        taskId: task.id,
        start: new Date(day.midnight + window.start * MS_PER_MINUTE),
        end: new Date(day.midnight + (window.start + used) * MS_PER_MINUTE),
      });
      window.start += used; // bagian ini sudah terpakai
      remaining -= used;
    }
  }
  return Math.max(remaining, 0);
}

export function schedule(input: ScheduleInput): SchedulePlan {
  const days = Array.from({ length: DAYS_TO_PLAN }, (_, offset) =>
    buildDay(input, offset),
  );

  // Hitung statistik waktu luang SEBELUM ada yang dialokasikan
  const freeMinutesNext7Days = days
    .slice(0, DAYS_IN_STATS)
    .flatMap((day) => day.windows)
    .reduce((sum, w) => sum + (w.end - w.start), 0);

  const slots: Slot[] = [];
  const shortfall: Record<string, number> = {};

  const activeTasks = input.tasks
    .filter((t) => !t.completed)
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));

  for (const task of activeTasks) {
    const missing = allocate(task, days, slots);
    if (missing > 0) shortfall[task.id] = missing;
  }

  return { slots, shortfall, freeMinutesNext7Days };
}
