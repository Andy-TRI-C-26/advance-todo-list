"use client";
import { useEffect, useState } from "react";

/**
 * Seperti useState, tetapi nilainya otomatis disimpan di localStorage.
 *
 * Mengembalikan [nilai, setNilai, ready].
 * `ready` bernilai true setelah data dibaca dari localStorage. Sebelum itu
 * nilainya masih `initialValue` (localStorage tidak ada di server).
 *
 * `normalize` memeriksa data yang tersimpan. Kembalikan `undefined`
 * jika bentuk datanya tidak valid, maka `initialValue` dipakai.
 * Definisikan `normalize` di luar komponen supaya identitasnya stabil.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  normalize: (stored: unknown) => T | undefined,
) {
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);

  // 1) Saat pertama tampil: baca dari localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const stored = normalize(JSON.parse(raw));
        if (stored !== undefined) setValue(stored);
      }
    } catch {
      // data rusak -> abaikan, pakai nilai awal
    }
    setReady(true);
  }, [key, normalize]);

  // 2) Setiap nilai berubah: simpan (setelah proses baca selesai)
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, ready]);

  return [value, setValue, ready] as const;
}
