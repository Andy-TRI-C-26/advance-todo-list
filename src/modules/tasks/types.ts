export type TaskPriority = "Tinggi" | "Sedang" | "Rendah";

export type Task = {
  id: string;
  title: string;
  /** Hanya id mata kuliah (bukan objeknya), supaya modul ini tidak terikat ke `courses`. "" = umum. */
  courseId: string;
  deadline: string; // "2026-10-25T14:30"
  hours: number; // estimasi pengerjaan
  priority: TaskPriority;
  completed?: boolean;
  /** Label bebas, mis. "Ujian". Opsional supaya tugas lama tetap valid. */
  tags?: string[];
};

/** Pilihan tag yang ditawarkan di form. Daftar ini bisa ditambah kapan saja. */
export const TASK_TAGS = ["Prioritas Tinggi", "Ujian", "Tugas Kelompok", "Bacaan"];
