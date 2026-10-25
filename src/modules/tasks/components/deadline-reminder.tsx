"use client";
import { useEffect, useRef } from "react";
import { useNow } from "@/shared/hooks/use-now";
import { useToast } from "@/modules/notifications";
import { useTasks } from "../tasks-context";
import { hoursLeft } from "../deadline";

/**
 * Komponen tanpa tampilan: hanya menjalankan efek samping.
 * Saat aplikasi dibuka, beri peringatan untuk tugas yang deadline-nya < 24 jam.
 */
export function DeadlineReminder() {
  const { tasks, ready } = useTasks();
  const now = useNow();
  const toast = useToast();
  const alreadyChecked = useRef(false);

  useEffect(() => {
    if (!ready || alreadyChecked.current) return;
    alreadyChecked.current = true;

    tasks
      .filter((t) => {
        const left = hoursLeft(t.deadline, now);
        return !t.completed && left > 0 && left < 24;
      })
      .forEach((t) =>
        toast(`Deadline mendesak: ${t.title} (kurang dari 24 jam)`, "urgent"),
      );
    // Sengaja hanya bergantung pada `ready`: cek ini cukup sekali per pembukaan aplikasi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return null;
}
