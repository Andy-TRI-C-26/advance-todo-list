// Semua kunci localStorage dikumpulkan di satu tempat supaya tidak bentrok.
// Setiap modul memiliki satu kuncinya sendiri.

export const STORAGE_KEYS = {
  tasks: "nugas-in:tasks",
  courses: "nugas-in:courses",
  settings: "nugas-in:settings",
  /** Kunci lama (semua data dalam satu objek). Hanya dipakai untuk migrasi. */
  legacy: "nugas-in:v1",
} as const;
