import { Task } from "@/modules/tasks";
import { SchedulePlan, Slot } from "@/modules/scheduling";

/**
 * Format string untuk format iCalendar (RFC 5545).
 * Escape karakter khusus.
 */
function escapeIcs(str: string): string {
  return str.replace(/[\\;,\n\r]/g, (match) => "\\" + match);
}

/**
 * Format tanggal ke ISO 8601 tanpa milidetik (YYYYMMDDTHHMMSSZ).
 */
function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateIcs(tasks: Task[], plan: SchedulePlan): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//nugas.in//Backup//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  // Tambahkan tugas sebagai VEVENT
  tasks.forEach((task) => {
    const deadline = new Date(task.deadline);
    const start = deadline;
    const end = new Date(deadline.getTime() + 3600000); // Default 1 jam

    lines.push(
      "BEGIN:VEVENT",
      `UID:${task.id}@nugas.in`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${escapeIcs(task.title)}`,
      `DESCRIPTION:Tugas dari nugas.in`,
      "END:VEVENT"
    );
  });

  // Tambahkan jadwal sebagai VEVENT
  plan.slots.forEach((slot: Slot) => {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${slot.start.getTime()}-${slot.taskId}@nugas.in`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(slot.start)}`,
      `DTEND:${formatDate(slot.end)}`,
      `SUMMARY:Nugas: ${slot.taskId}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
