"use client";

import { useEffect, useRef } from "react";
import { pad } from "../lib/date-time";

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

function parseTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return {
    hours: Number.isInteger(hours) && hours >= 0 && hours <= 23 ? hours : 0,
    minutes:
      Number.isInteger(minutes) && minutes >= 0 && minutes <= 59 ? minutes : 0,
  };
}

export function TimePicker({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const { hours, minutes } = parseTime(value);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const centerSelected = (container: HTMLDivElement | null) => {
      const selected = container?.querySelector<HTMLElement>(
        '[aria-pressed="true"]',
      );
      if (!container || !selected) return;
      container.scrollTop =
        selected.offsetTop -
        container.clientHeight / 2 +
        selected.clientHeight / 2;
    };

    centerSelected(hourRef.current);
    centerSelected(minuteRef.current);
  }, [hours, minutes]);

  const choose = (nextHours: number, nextMinutes: number) =>
    onChange(`${pad(nextHours)}:${pad(nextMinutes)}`);

  const listClass =
    "relative h-28 overflow-y-auto rounded-lg border border-slate-200 p-1 no-scrollbar dark:border-slate-700 dark:bg-slate-800/50";
  const buttonClass =
    "block h-8 w-full rounded-md text-sm transition-colors focus-visible:relative focus-visible:z-10";
  const selectedClass = "bg-indigo-600 text-white";
  const idleClass = "hover:bg-slate-100 dark:hover:bg-slate-800";

  return (
    <div
      className="flex items-start justify-center gap-2"
      aria-label={ariaLabel}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-center text-xs text-slate-400">Jam</div>
        <div ref={hourRef} className={listClass}>
          {HOURS.map((hour) => (
            <button
              key={hour}
              type="button"
              aria-label={`Jam ${pad(hour)}`}
              aria-pressed={hours === hour}
              onClick={() => choose(hour, minutes)}
              className={`${buttonClass} ${
                hours === hour ? selectedClass : idleClass
              }`}
            >
              {pad(hour)}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-7 text-lg font-semibold text-slate-400" aria-hidden="true">
        :
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-center text-xs text-slate-400">Menit</div>
        <div ref={minuteRef} className={listClass}>
          {MINUTES.map((minute) => (
            <button
              key={minute}
              type="button"
              aria-label={`Menit ${pad(minute)}`}
              aria-pressed={minutes === minute}
              onClick={() => choose(hours, minute)}
              className={`${buttonClass} ${
                minutes === minute ? selectedClass : idleClass
              }`}
            >
              {pad(minute)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
