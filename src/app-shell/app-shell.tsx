"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { useCourses } from "@/modules/courses";
import { ToastViewport } from "@/modules/notifications";
import { useSettings } from "@/modules/settings";
import { useTasks } from "@/modules/tasks";
import { AppHeader } from "./app-header";
import {
  PageOnboarding,
  WelcomeModal,
  type OnboardingPage,
} from "./onboarding-tour";
import { Sidebar } from "./sidebar";

/** Kerangka halaman: sidebar, header, area isi, dan toast. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { settings, ready: settingsReady, updateSettings } = useSettings();
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

  const pageByPath: Record<string, OnboardingPage> = {
    "/": "dashboard",
    "/jadwal": "jadwal",
    "/rekomendasi": "rekomendasi",
    "/pengaturan": "pengaturan",
  };
  const currentPage = pageByPath[pathname];
  const completedPages = settings.onboardingCompletedPages ?? [];
  const shouldShowPageGuide =
    Boolean(currentPage) &&
    settings.onboardingWelcomeSeen &&
    !completedPages.includes(currentPage);

  function skipAllGuides() {
    updateSettings({
      onboardingWelcomeSeen: true,
      onboardingCompleted: true,
      onboardingCompletedPages: [
        "dashboard",
        "jadwal",
        "rekomendasi",
        "pengaturan",
      ],
    });
  }

  function completeCurrentPage() {
    if (!currentPage) return;
    updateSettings({
      onboardingCompletedPages: [
        ...completedPages.filter((page) => page !== currentPage),
        currentPage,
      ],
    });
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-[#f4f6f8] text-[#18324a]",
        settings.dark && "dark bg-slate-950 text-slate-50",
      )}
    >
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && (
        <button
          className="fixed inset-0 z-20 bg-[#16324f]/30 backdrop-blur-[2px] transition-opacity lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Tutup navigasi"
        />
      )}

      <main className="min-h-screen lg:pl-64">
        <AppHeader onOpenMenu={() => setMenuOpen(true)} />
        <div
          id="page-content"
          className="mx-auto max-w-[1500px] p-5 sm:p-8"
        >
          {children}
        </div>
      </main>

      {!settings.onboardingWelcomeSeen && (
        <WelcomeModal
          onStart={() => updateSettings({ onboardingWelcomeSeen: true })}
          onSkip={skipAllGuides}
        />
      )}
      {shouldShowPageGuide && currentPage && (
        <PageOnboarding
          key={currentPage}
          page={currentPage}
          onComplete={completeCurrentPage}
          onSkip={completeCurrentPage}
        />
      )}
      <ToastViewport />
    </div>
  );
}
