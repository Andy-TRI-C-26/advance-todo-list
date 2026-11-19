"use client";

import { useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { useTasks } from "@/modules/tasks";
import { usePlan } from "@/modules/scheduling";
import { useCourses } from "@/modules/courses";
import { useToast } from "@/modules/notifications";
import { card } from "@/shared/ui/styles";
import { ExportToCalendarButton } from "./export-button";

type IcsEvent = {
  summary: string;
  start: Date;
  end: Date;
  description: string;
};

function unfoldIcsLines(contents: string) {
  return contents
    .replace(/\r\n[ \t]/g, "")
    .replace(/\r/g, "\n")
    .split("\n");
}

function parseIcsDate(value: string) {
  const match =
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second, utc] = match;
  if (utc) {
    return new Date(
      Date.UTC(+year, +month - 1, +day, +hour, +minute, +second),
    );
  }
  return new Date(+year, +month - 1, +day, +hour, +minute, +second);
}

function unescapeIcs(value: string) {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\([\\;,])/g, "$1");
}

function parseIcs(contents: string): IcsEvent[] {
  const events: IcsEvent[] = [];
  let current: Partial<IcsEvent> | null = null;

  for (const line of unfoldIcsLines(contents)) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current?.summary && current.start && current.end) {
        events.push(current as IcsEvent);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const property = line.slice(0, separator).split(";")[0];
    const value = unescapeIcs(line.slice(separator + 1));
    if (property === "SUMMARY") current.summary = value;
    if (property === "DTSTART") current.start = parseIcsDate(value) ?? undefined;
    if (property === "DTEND") current.end = parseIcsDate(value) ?? undefined;
    if (property === "DESCRIPTION") current.description = value;
  }

  return events;
}

export function CalendarBackupCard() {
  const { tasks } = useTasks();
  const plan = usePlan();
  const { courses, saveCourse } = useCourses();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState("");

  async function importCalendar(file: File) {
    setImportError("");
    try {
      const events = parseIcs(await file.text());
      if (events.length === 0) {
        throw new Error("Tidak ada acara kalender yang dapat dibaca.");
      }

      const courseEvents = events.filter(
        (event) =>
          event.description !== "Tugas dari nugas.in" &&
          !event.summary.startsWith("Nugas:"),
      );
      const existingNames = new Set(
        courses.map((course) => course.name.toLowerCase()),
      );

      let importedCount = 0;
      for (const event of courseEvents) {
        const dayNames = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];
        const day = dayNames[event.start.getDay()];
        const toTime = (date: Date) =>
          `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        const name = event.summary.trim();
        if (!name || existingNames.has(name.toLowerCase())) continue;

        saveCourse({
          id: `c${event.start.getTime()}`,
          name,
          day,
          start: toTime(event.start),
          end: toTime(event.end),
          room: "",
          lecturer: "",
          color: "#6366f1",
        });
        existingNames.add(name.toLowerCase());
        importedCount += 1;
      }

      if (importedCount === 0) {
        throw new Error("Tidak ada jadwal baru yang ditemukan dalam file.");
      }
      toast(`${importedCount} jadwal kalender berhasil diimpor.`, "success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "File kalender tidak dapat dibaca.";
      setImportError(message);
      toast("Impor kalender gagal.", "urgent");
    }
  }

  return (
    <div data-tour="calendar-backup" className={card}>
      <div className="flex items-start gap-4">
        <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
          <Calendar className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Kalender offline (.ics)</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ekspor {tasks.length} tugas dan {plan.slots.length} sesi jadwal, atau
          impor jadwal mata kuliah dari file iCalendar (.ics).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ExportToCalendarButton />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium transition hover:border-[#8dd3c7] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            Impor .ics
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ics,text/calendar"
            className="sr-only"
            aria-label="Pilih file kalender .ics"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importCalendar(file);
              event.target.value = "";
            }}
          />
          </div>
          {importError && (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400" role="alert">
            {importError}
          </p>
          )}
        </div>
      </div>
    </div>
  );
}
