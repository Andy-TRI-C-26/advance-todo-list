/** Satu blok waktu nugas yang dialokasikan untuk sebuah tugas. */
export type Slot = { taskId: string; start: Date; end: Date };

export type SchedulePlan = {
  /** Blok-blok waktu nugas hasil penjadwalan. */
  slots: Slot[];
  /** Tugas yang waktunya tidak cukup: { idTugas: sisaMenitYangTidakTerjadwal } */
  shortfall: Record<string, number>;
  /** Total menit waktu luang 7 hari ke depan (sebelum dialokasikan). */
  freeMinutesNext7Days: number;
};
