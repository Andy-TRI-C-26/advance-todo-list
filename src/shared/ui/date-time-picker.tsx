"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildDateTime,
  MONTHS,
  pad,
  parseDateTime,
  WEEK,
} from "../lib/date-time";

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
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  // Saat panel muncul, gulung daftar jam/menit ke nilai terpilih
  useEffect(() => {
    const center = (box: HTMLDivElement | null) => {
      const el = box?.querySelector<HTMLElement>('[data-sel="true"]');
      if (box && el)
        box.scrollTop =
          el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2;
    };
    center(hourRef.current);
    center(minRef.current);
  }, []);

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

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from(
    new Set([...Array.from({ length: 12 }, (_, i) => i * 5), p.mi]),
  ).sort((a, b) => a - b);

  const sel = "bg-indigo-600 text-white";
  const small =
    "rounded-md border border-slate-200 bg-white px-1.5 py-1 text-sm outline-none focus:border-indigo-500";

  return (
    <div className="text-slate-800">
      {/* ===== TANGGAL ===== */}
      <div className="mb-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100"
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
          className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100"
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
                picked ? sel : "hover:bg-slate-100"
              } ${today && !picked ? "font-semibold text-indigo-600" : ""}`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* ===== GARIS PEMISAH HORIZONTAL ===== */}
      <hr className="my-3 border-slate-200" />

      {/* ===== JAM ===== */}
      <div className="flex items-start justify-center gap-2">
        <div className="flex-1">
          <div className="mb-1 text-center text-xs text-slate-400">Jam</div>
          <div
            ref={hourRef}
            className="relative h-28 overflow-y-auto rounded-lg border border-slate-200 p-1 no-scrollbar"
          >
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                data-sel={p.h === h}
                onClick={() => onChange(buildDateTime({ ...p, h }))}
                className={`block h-8 w-full rounded-md text-sm ${
                  p.h === h ? sel : "hover:bg-slate-100"
                }`}
              >
                {pad(h)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-7 text-lg font-semibold text-slate-400">:</div>
        <div className="flex-1">
          <div className="mb-1 text-center text-xs text-slate-400">Menit</div>
          <div
            ref={minRef}
            className="relative h-28 overflow-y-auto rounded-lg border border-slate-200 p-1 no-scrollbar"
          >
            {minutes.map((m) => (
              <button
                key={m}
                type="button"
                data-sel={p.mi === m}
                onClick={() => onChange(buildDateTime({ ...p, mi: m }))}
                className={`block h-8 w-full rounded-md text-sm ${
                  p.mi === m ? sel : "hover:bg-slate-100"
                }`}
              >
                {pad(m)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Selesai
      </button>
    </div>
  );
}
