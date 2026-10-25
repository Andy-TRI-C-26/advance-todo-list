"use client";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useCourses } from "@/modules/courses";
import { ToastViewport } from "@/modules/notifications";
import { useSettings } from "@/modules/settings";
import { useTasks } from "@/modules/tasks";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";

/** Kerangka halaman: sidebar, header, area isi, dan toast. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings, ready: settingsReady } = useSettings();
  const { ready: coursesReady } = useCourses();
  const { ready: tasksReady } = useTasks();

  // Tunggu semua data selesai dibaca dari localStorage sebelum menampilkan halaman
  if (!settingsReady || !coursesReady || !tasksReady) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-400">
        Memuat nugas.in...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-[#f6f7fb] text-slate-950",
        settings.dark && "dark bg-slate-950 text-slate-50",
      )}
    >
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && (
        <button
          className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Tutup navigasi"
        />
      )}

      <main className="min-h-screen lg:pl-64">
        <AppHeader onOpenMenu={() => setMenuOpen(true)} />
        <div className="mx-auto max-w-[1500px] p-5 sm:p-8">{children}</div>
      </main>

      <ToastViewport />
    </div>
  );
}
