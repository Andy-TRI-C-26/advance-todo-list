"use client";

import { useTasks } from "@/modules/tasks";
import { usePlan } from "@/modules/scheduling";
import { generateIcs } from "../lib/ics-generator";
import { Button } from "@/shared/ui/button";

export function ExportToCalendarButton() {
  const { tasks } = useTasks();
  const plan = usePlan();
  const handleExport = () => {
    const icsContent = generateIcs(tasks, plan);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nugas-in-backup.ics";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleExport} aria-label="Ekspor jadwal ke file .ics">
      Ekspor .ics
    </Button>
  );
}
