"use client";
import { cn } from "@/shared/lib/utils";
import { useNow } from "@/shared/hooks/use-now";
import { DAYS, toHHMM, toMinutes } from "@/shared/lib/date-time";
import { colorOf, useCourses } from "@/modules/courses";
import { useSettings } from "@/modules/settings";
import { useTasks } from "@/modules/tasks";
import { usePlan } from "../scheduling-provider";

const HOUR_HEIGHT = 40; // px per jam
const START = 5 * 60; // kalender mulai pukul 05.00
const END = 22 * 60; // ...sampai 22.00
const hours = Array.from({ length: 18 }, (_, i) => i + 5);
const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();

export function WeekCalendar() {
  const { courses, saveCourse } = useCourses();
  const { tasks } = useTasks();
  const { settings } = useSettings();
  const plan = usePlan();
  const now = useNow();
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - ((now.getDay() + 6) % 7),
  );
  const week = DAYS.map((name, i) => ({
    name,
    date: new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i,
    ),
  }));
  function drop(e: React.DragEvent<HTMLDivElement>, day: string) {
    e.preventDefault();
    const c = courses.find((x) => x.id === e.dataTransfer.getData("text"));
    if (!c) return;
    const dur = toMinutes(c.end) - toMinutes(c.start),
      y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    const s = Math.min(
      Math.max(Math.round((START + (y / HOUR_HEIGHT) * 60) / 15) * 15, START),
      END - dur,
    );
    saveCourse({ ...c, day, start: toHHMM(s), end: toHHMM(s + dur) });
  }
  const g = "grid grid-cols-[58px_repeat(7,1fr)]";
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="min-w-190">
        <div
          className={cn(g, "border-b border-slate-100 dark:border-slate-800")}
        >
          <div />
          {week.map((w) => (
            <div
              key={w.name}
              className="py-3 text-center text-[11px] font-semibold text-slate-400"
            >
              {w.name.slice(0, 3)}{" "}
              <span
                className={cn(
                  "ml-0.5 inline-grid size-6 place-items-center rounded-full",
                  w.date.toDateString() === now.toDateString() &&
                    "bg-primary text-primary-foreground",
                )}
              >
                {w.date.getDate()}
              </span>
            </div>
          ))}
        </div>
        <div className={g}>
          <div>
            {hours.map((h) => (
              <div
                key={h}
                className="h-10 border-b border-slate-100 pr-2 pt-1 text-right text-[10px] text-slate-400 dark:border-slate-800"
              >{`${String(h).padStart(2, "0")}:00`}</div>
            ))}
          </div>
          {week.map((w) => (
            <div
              key={w.name}
              className="relative border-l border-slate-100 dark:border-slate-800"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => drop(e, w.name)}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-10 border-b border-slate-100 dark:border-slate-800"
                />
              ))}
              {courses
                .filter((c) => c.day === w.name)
                .map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text", c.id)}
                    title="Seret untuk memindahkan jadwal"
                    className={cn(
                      "absolute inset-x-1 cursor-grab overflow-hidden rounded-lg border-l-4 p-2 text-[10px] font-semibold",
                      colorOf(c.color).blk,
                    )}
                    style={{
                      top: ((toMinutes(c.start) - START) / 60) * HOUR_HEIGHT,
                      height:
                        ((toMinutes(c.end) - toMinutes(c.start)) / 60) *
                          HOUR_HEIGHT -
                        2,
                    }}
                  >
                    {c.name}
                    <br />
                    <span className="font-normal">
                      {c.start} – {c.end}
                    </span>
                  </div>
                ))}
              {plan.slots
                .filter((s) => s.start.toDateString() === w.date.toDateString())
                .map((s, i) => (
                  <div
                    key={i}
                    className="pointer-events-none absolute inset-x-1 overflow-hidden rounded-lg border border-dashed border-teal-500 bg-teal-50/80 p-1.5 text-[9px] font-semibold text-teal-700 dark:bg-teal-950/70 dark:text-teal-200"
                    style={{
                      top: ((minutesOfDay(s.start) - START) / 60) * HOUR_HEIGHT,
                      height: Math.max(
                        ((minutesOfDay(s.end) - minutesOfDay(s.start)) / 60) *
                          HOUR_HEIGHT -
                          2,
                        14,
                      ),
                    }}
                  >
                    {tasks.find((t) => t.id === s.taskId)?.title} ·{" "}
                    {Math.round(
                      (minutesOfDay(s.end) - minutesOfDay(s.start)) / 6,
                    ) / 10}
                    j
                  </div>
                ))}
            </div>
          ))}
        </div>
        <div
          className="py-2 text-center text-[11px] text-slate-300"
          style={{
            background:
              "repeating-linear-gradient(45deg,#1e293b,#1e293b 6px,#334155 6px,#334155 12px)",
          }}
        >
          Jam tidur {settings.sleepStart.replace(":", ".")} –{" "}
          {settings.sleepEnd.replace(":", ".")} (tidak dijadwalkan)
        </div>
      </div>
    </div>
  );
}
