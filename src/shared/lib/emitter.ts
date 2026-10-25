// Pemancar event super kecil.
//
// Dipakai supaya satu modul bisa memberi tahu modul lain tanpa saling import.
// Contoh: modul `courses` memancarkan "kuliah dihapus", modul `tasks` mendengarkan.
// `courses` tidak perlu tahu `tasks` itu ada.

export type Listener<T> = (payload: T) => void;

export function createEmitter<T>() {
  const listeners = new Set<Listener<T>>();

  return {
    /** Berlangganan. Mengembalikan fungsi untuk berhenti berlangganan. */
    on(listener: Listener<T>) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit(payload: T) {
      listeners.forEach((listener) => listener(payload));
    },
  };
}
