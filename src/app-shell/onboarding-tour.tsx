"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, MousePointer2, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { primaryButton, secondaryButton } from "@/shared/ui/styles";
import { EASE } from "@/shared/ui/motion";

export type OnboardingPage =
  | "dashboard"
  | "jadwal"
  | "rekomendasi"
  | "pengaturan";

type TourStep = {
  selector: string;
  title: string;
  description: string;
};

const TOUR_STEPS: Record<OnboardingPage, TourStep[]> = {
  dashboard: [
    {
      selector: '[data-tour="add-task"]',
      title: "Tambah tugas dari sini",
      description:
        "Klik tombol ini untuk membuat tugas baru. Kamu dapat mengisi nama tugas, mata kuliah, estimasi waktu, prioritas, sub-tugas, dan tenggat.",
    },
    {
      selector: '[data-tour="dashboard-stats"]',
      title: "Ringkasan aktivitas kuliahmu",
      description:
        "Bagian ini menampilkan jumlah tugas aktif, total jam yang dibutuhkan, dan keseimbangan jadwal berdasarkan waktu luang serta deadline.",
    },
    {
      selector: '[data-tour="task-list"]',
      title: "Kelola dan ikuti progres tugas",
      description:
        "Setiap kartu menampilkan mata kuliah, estimasi, prioritas, deadline, dan status selesai. Gunakan ikon centang, jam, pensil, atau tempat sampah untuk melacak, fokus, mengubah, atau menghapus tugas.",
    },
    {
      selector: '[data-tour="week-calendar"]',
      title: "Lihat jadwal dalam satu minggu",
      description:
        "Kalender menggabungkan jadwal kuliah dengan slot belajar. Jadwal kuliah berwarna ungu dapat dipindahkan dengan seret, sedangkan waktu nugas membantu menjaga progres.",
    },
  ],
  jadwal: [
    {
      selector: '[data-tour="add-course"]',
      title: "Tambahkan jadwal kuliah",
      description:
        "Gunakan tombol ini untuk mencatat mata kuliah beserta hari, jam, ruang, dan dosen. Data ini dipakai sistem untuk menghindari benturan jadwal.",
    },
    {
      selector: '[data-tour="course-list"]',
      title: "Kelola daftar mata kuliah",
      description:
        "Daftar ini menampilkan semua mata kuliah. Gunakan ikon pensil untuk mengubah jadwal dan ikon tempat sampah untuk menghapusnya.",
    },
  ],
  rekomendasi: [
    {
      selector: '[data-tour="recommendation-select"]',
      title: "Pilih tugas yang ingin dijadwalkan",
      description:
        "Pilih satu tugas aktif. Deadline dan estimasi waktu tugas tersebut menjadi dasar AI dalam mencari slot belajar.",
    },
    {
      selector: '[data-tour="recommendation-action"]',
      title: "Buat rekomendasi waktu terbaik",
      description:
        "Tombol ini meminta AI mempertimbangkan jadwal kuliah, jam tidur, deadline, prioritas, dan waktu luangmu.",
    },
    {
      selector: '[data-tour="recommendation-result"]',
      title: "Pahami dan terapkan hasilnya",
      description:
        "Hasil berisi waktu yang disarankan, alasan, dan langkah fokus. Gunakan tombol Tambahkan ke jadwal untuk menerapkan rekomendasi.",
    },
  ],
  pengaturan: [
    {
      selector: '[data-tour="profile-name"]',
      title: "Personalisasi profil",
      description:
        "Masukkan nama yang ingin ditampilkan pada profil. Nama juga membantu aplikasi terasa lebih personal.",
    },
    {
      selector: '[data-tour="local-storage"]',
      title: "Ketahui tempat datamu tersimpan",
      description:
        "Kartu ini menunjukkan tugas dan jadwal yang tersimpan otomatis di browser perangkat ini.",
    },
    {
      selector: '[data-tour="calendar-backup"]',
      title: "Ekspor atau impor kalender",
      description:
        "Unduh tugas dan sesi belajar sebagai file kalender, atau impor jadwal mata kuliah dari file .ics.",
    },
    {
      selector: '[data-tour="drive-backup"]',
      title: "Amankan data dengan Google Drive",
      description:
        "Hubungkan Google Drive untuk membuat cadangan atau memulihkan data setelah browser dibersihkan.",
    },
    {
      selector: '[data-tour="sleep-hours"]',
      title: "Jaga waktu istirahat",
      description:
        "Scheduler tidak akan menempatkan tugas pada rentang jam tidur agar jadwalmu tetap realistis.",
    },
  ],
};

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function WelcomeModal({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      closedby="none"
      aria-labelledby="welcome-title"
      aria-describedby="welcome-description"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border-0 bg-transparent p-0 shadow-none backdrop:bg-slate-950/40"
    >
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
      >
        <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-6" aria-hidden="true" />
        </div>
        <h2
          id="welcome-title"
          className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-50"
        >
          Selamat datang di nugas.in
        </h2>
        <p
          id="welcome-description"
          className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
        >
          Ikuti guide singkat untuk mengenali fungsi utama setiap halaman.
          Guide akan muncul saat pertama kali kamu membuka halaman tersebut.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onSkip} className={secondaryButton}>
            Lewati semua
          </button>
          <button type="button" onClick={onStart} className={primaryButton}>
            Mulai guide
          </button>
        </div>
      </motion.section>
    </dialog>
  );
}

export function PageOnboarding({
  page,
  onComplete,
  onSkip,
}: {
  page: OnboardingPage;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const steps = TOUR_STEPS[page];
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    setStepIndex(0);
  }, [page]);

  useEffect(() => {
    let frameId = 0;
    let focusTimeoutId = 0;

    function updateTargetRect() {
      const target = document.querySelector<HTMLElement>(step.selector);
      if (!target) {
        frameId = window.requestAnimationFrame(updateTargetRect);
        return;
      }

      target.scrollIntoView({ block: "center", inline: "nearest" });
      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }

    frameId = window.requestAnimationFrame(updateTargetRect);
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);
    focusTimeoutId = window.setTimeout(
      () => nextButtonRef.current?.focus(),
      250,
    );

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(focusTimeoutId);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [step.selector]);

  function moveNext() {
    if (isLastStep) {
      onComplete();
      return;
    }
    setStepIndex((currentIndex) => currentIndex + 1);
  }

  const tooltipPosition = (() => {
    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const viewportWidth =
      typeof window === "undefined" ? 360 : window.innerWidth;
    const viewportHeight =
      typeof window === "undefined" ? 720 : window.innerHeight;
    const tooltipWidth = Math.min(360, viewportWidth - 32);
    const estimatedHeight = 220;
    const left = Math.min(
      Math.max(16, targetRect.left),
      viewportWidth - tooltipWidth - 16,
    );
    const placeBelow =
      targetRect.top + targetRect.height + estimatedHeight + 24 <
      viewportHeight;
    const top = placeBelow
      ? targetRect.top + targetRect.height + 16
      : Math.max(16, targetRect.top - estimatedHeight - 16);

    return { top, left, width: tooltipWidth };
  })();

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
      className="fixed inset-0 z-[100]"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/20" />
      {targetRect && (
        <motion.div
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE }}
          className="pointer-events-none absolute rounded-2xl ring-4 ring-primary ring-offset-4 ring-offset-transparent"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow:
              "0 0 0 9999px rgba(15, 23, 42, 0.42), 0 18px 45px rgba(14, 165, 233, 0.28)",
          }}
        >
          <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <MousePointer2 className="size-4" aria-hidden="true" />
          </span>
        </motion.div>
      )}

      <motion.div
        key={`${page}-${stepIndex}`}
        initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE }}
        className="absolute z-10 rounded-2xl border border-white/70 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        style={tooltipPosition}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[#16324f] dark:bg-slate-800 dark:text-slate-100">
            {page.toUpperCase()} · {stepIndex + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={onSkip}
            className={`${secondaryButton} px-3 py-1.5`}
          >
            Lewati
          </button>
        </div>
        <h2
          id="onboarding-title"
          className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-50"
        >
          {step.title}
        </h2>
        <p
          id="onboarding-description"
          className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
        >
          {step.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div
            className="flex min-w-0 flex-1 gap-1.5"
            aria-label={`Langkah ${stepIndex + 1} dari ${steps.length}`}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={stepIndex + 1}
          >
            {steps.map((item, index) => (
              <span
                key={item.selector}
                aria-hidden="true"
                className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              >
                <motion.span
                  initial={false}
                  animate={{ width: index <= stepIndex ? "100%" : "0%" }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.25,
                    ease: EASE,
                  }}
                  className="block h-full rounded-full bg-[#16324f] dark:bg-sky-300"
                />
              </span>
            ))}
          </div>
          <button
            ref={nextButtonRef}
            type="button"
            onClick={moveNext}
            className={`${primaryButton} min-w-24`}
          >
            {isLastStep ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Check className="size-4" aria-hidden="true" />
                Selesai
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                Selanjutnya
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
