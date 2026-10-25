// Fungsi tanggal & jam murni (pure) yang dipakai banyak modul.
// Aturan: file ini tidak boleh tahu apa pun tentang tugas, kuliah, dsb.

export const DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const WEEKDAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]; // urutan Date.getDay()

/** Header kalender, mulai Senin. */
export const WEEK = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export const pad = (n: number) => String(n).padStart(2, "0");

/** "08:30" -> 510 (menit sejak 00:00) */
export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** 510 -> "08:30" */
export const toHHMM = (minutes: number) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/** Date -> "2026-10-25T14:30" (format <input type="datetime-local">, waktu lokal) */
export const toLocalInput = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);

// ---------- Deadline sebagai potongan-potongan angka ----------

export type DateTimeParts = {
  y: number;
  m: number; // 0-11
  d: number;
  h: number;
  mi: number;
};

/** "2026-10-25T14:30" -> { y, m, d, h, mi }. Format salah -> pakai waktu sekarang. */
export function parseDateTime(value: string): DateTimeParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value);
  if (match) {
    return {
      y: +match[1],
      m: +match[2] - 1,
      d: +match[3],
      h: +match[4],
      mi: +match[5],
    };
  }
  const now = new Date();
  return {
    y: now.getFullYear(),
    m: now.getMonth(),
    d: now.getDate(),
    h: now.getHours(),
    mi: now.getMinutes(),
  };
}

/** Kebalikan parseDateTime. */
export const buildDateTime = (p: DateTimeParts) =>
  `${p.y}-${pad(p.m + 1)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`;

/** "2026-10-25T14:30" -> "Min, 25 Okt 2026 · 14.30" */
export function formatDateTimeLabel(value: string) {
  const p = parseDateTime(value);
  const weekday = WEEKDAYS_SHORT[new Date(p.y, p.m, p.d).getDay()];
  return `${weekday}, ${p.d} ${MONTHS_SHORT[p.m]} ${p.y} · ${pad(p.h)}.${pad(p.mi)}`;
}
