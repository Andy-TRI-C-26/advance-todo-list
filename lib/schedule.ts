import type { Course, DT, Slot, Task } from "./types";
export const DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];
const JS_DAY = ["Minggu", ...DAYS.slice(0, 6)]; // urutan Date.getDay()

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
const MON_SHORT = [
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
const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const WEEK = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]; // mulai Senin

export const pad = (n: number) => String(n).padStart(2, "0");

export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const toHHMM = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const toLocalInput = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 6e4)
    .toISOString()
    .slice(0, 16);

// Earliest Deadline First: slot kosong = jam operasional (di luar jam tidur) dikurangi jam kuliah.
export function schedule(
  tasks: Task[],
  courses: Course[],
  sleepStart: string,
  sleepEnd: string,
  now: Date,
) {
  const open = toMin(sleepEnd),
    close = toMin(sleepStart);
  const days: { base: number; free: number[][] }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    let free = [
      [
        i === 0
          ? Math.max(
              open,
              Math.ceil((now.getHours() * 60 + now.getMinutes()) / 15) * 15,
            )
          : open,
        close,
      ],
    ];
    for (const c of courses.filter((c) => c.day === JS_DAY[d.getDay()])) {
      const bs = toMin(c.start),
        be = toMin(c.end);
      free = free
        .flatMap(([s, e]) =>
          be <= s || bs >= e
            ? [[s, e]]
            : [
                [s, Math.min(bs, e)],
                [Math.max(be, s), e],
              ],
        )
        .filter(([s, e]) => e > s);
    }
    days.push({ base: d.getTime(), free });
  }
  const free7 = days
    .slice(0, 7)
    .reduce((s, d) => s + d.free.reduce((a, [x, y]) => a + y - x, 0), 0);
  const slots: Slot[] = [],
    short: Record<string, number> = {};
  for (const t of tasks
    .filter((t) => !t.completed)
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline))) {
    let sisa = t.hours * 60;
    const dl = new Date(t.deadline).getTime();
    for (const h of days)
      for (const f of h.free) {
        if (sisa <= 0) break;
        const end = Math.min(f[1], Math.floor((dl - h.base) / 6e4));
        if (end - f[0] <= 0) continue;
        const use = Math.min(sisa, end - f[0]);
        slots.push({
          taskId: t.id,
          start: new Date(h.base + f[0] * 6e4),
          end: new Date(h.base + (f[0] + use) * 6e4),
        });
        f[0] += use;
        sisa -= use;
      }
    if (sisa > 0) short[t.id] = sisa;
  }
  return { slots, short, free7 };
}
export const daysLeft = (deadline: string, now: Date) =>
  Math.ceil((+new Date(deadline) - +now) / 864e5);

export function parseDT(s: string): DT {
  const r = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(s);
  if (r) return { y: +r[1], m: +r[2] - 1, d: +r[3], h: +r[4], mi: +r[5] };
  const n = new Date();
  return {
    y: n.getFullYear(),
    m: n.getMonth(),
    d: n.getDate(),
    h: n.getHours(),
    mi: n.getMinutes(),
  };
}
export const buildDT = (p: DT) =>
  `${p.y}-${pad(p.m + 1)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`;

export function deadlineLabel(value: string) {
  const p = parseDT(value);
  return `${DOW[new Date(p.y, p.m, p.d).getDay()]}, ${p.d} ${MON_SHORT[p.m]} ${p.y} · ${pad(p.h)}.${pad(p.mi)}`;
}
