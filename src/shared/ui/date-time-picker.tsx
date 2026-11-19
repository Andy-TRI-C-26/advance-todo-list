"use client";

import { useState } from "react";
import {
  buildDateTime,
  MONTHS,
  parseDateTime,
  WEEK,
} from "../lib/date-time";
import { TimePicker } from "./time-picker";

/** Panel tanggal (atas) + garis + jam (bawah). Tanpa kartu sendiri, menyatu dengan modal. */
export function DateTimePicker({
  value,
  onChange,
  onDone,
}: {
  value: string;
  onChange: (v: string) => void;
  onDone: () => void;
}) {
  const p = parseDateTime(value);
  const [view, setView] = useState({ y: p.y, m: p.m });
  const now = new Date();
  const years: number[] = [];
  for (
    let y = Math.min(now.getFullYear() - 5, view.y);
    y <= Math.max(now.getFullYear() + 10, view.y);
    y++
  )
    years.push(y);

  const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysIn }, (_, i) => i + 1),
  ];
  while (cells.length < 42) cells.push(null);
  const shift = (n: number) =>
    setView((s) => {
      const d = new Date(s.y, s.m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const sel = "bg-indigo-600 text-white";
  const small =
    "rounded-md border border-slate-200 bg-white px-1.5 py-1 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

  return (
    <div className="text-slate-800 dark:text-slate-200">
      {/* ===== TANGGAL ===== */}
      <div className="mb-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Bulan sebelumnya"
        >
          ‹
        </button>
        <select
          className={`${small} flex-1`}
          value={view.m}
          onChange={(e) => setView((s) => ({ ...s, m: +e.target.value }))}
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>
              {m}
            </option>
          ))}
        </select>
        <select
          className={small}
          value={view.y}
          onChange={(e) => setView((s) => ({ ...s, y: +e.target.value }))}
        >
          {years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => shift(1)}
          className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Bulan berikutnya"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-slate-400">
        {WEEK.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const picked = p.y === view.y && p.m === view.m && p.d === d;
          const today =
            now.getFullYear() === view.y &&
            now.getMonth() === view.m &&
            now.getDate() === d;
          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                onChange(buildDateTime({ ...p, y: view.y, m: view.m, d }))
              }
              className={`h-8 rounded-md text-sm ${
                picked ? sel : "hover:bg-slate-100 dark:hover:bg-slate-800"
              } ${today && !picked ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* ===== GARIS PEMISAH HORIZONTAL ===== */}
      <hr className="my-3 border-slate-200 dark:border-slate-700" />

      <TimePicker
        value={`${String(p.h).padStart(2, "0")}:${String(p.mi).padStart(2, "0")}`}
        onChange={(time) => {
          const [h, mi] = time.split(":").map(Number);
          onChange(buildDateTime({ ...p, h, mi }));
        }}
        ariaLabel="Pilih waktu deadline"
      />

      <button
        type="button"
        onClick={onDone}
        className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Selesai
      </button>
    </div>
  );
}
