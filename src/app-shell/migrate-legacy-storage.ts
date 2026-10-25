import { STORAGE_KEYS } from "@/shared/lib/storage-keys";

/**
 * Versi lama aplikasi menyimpan semua data dalam SATU kunci ("nugas-in:v1").
 * Sekarang tiap modul punya kuncinya sendiri. Fungsi ini memindahkan data lama
 * sekali saja, jadi pengguna lama tidak kehilangan tugas dan jadwalnya.
 * Aman dipanggil berkali-kali (kunci lama dihapus setelah dipindah).
 */
export function migrateLegacyStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.legacy);
    if (!raw) return;

    const legacy = JSON.parse(raw);
    const move = (key: string, value: unknown) => {
      // Jangan menimpa data baru yang mungkin sudah ada
      if (value && localStorage.getItem(key) === null)
        localStorage.setItem(key, JSON.stringify(value));
    };
    move(STORAGE_KEYS.tasks, legacy?.tasks);
    move(STORAGE_KEYS.courses, legacy?.courses);
    move(STORAGE_KEYS.settings, legacy?.settings);

    localStorage.removeItem(STORAGE_KEYS.legacy);
  } catch {
    // data lama rusak -> abaikan
  }
}
