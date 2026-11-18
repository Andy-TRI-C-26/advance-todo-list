import type { CSSProperties } from "react";

// Warna mata kuliah disimpan sebagai kode hex, mis. "#6366f1".
// Hex diterapkan lewat `style`, karena Tailwind tidak bisa membuat class dari nilai dinamis.

// Data lama menyimpan kunci ("blue", dst.). Dipetakan ke hex supaya tetap berwarna.
const LEGACY_HEX: Record<string, string> = {
  blue: "#6366f1",
  violet: "#8b5cf6",
  rose: "#f43f5e",
  amber: "#f59e0b",
};

const HEX_RE = /^#[0-9a-f]{6}$/i;

/** Ubah nilai warna (hex atau kunci lama) menjadi hex. Dipakai juga oleh color picker. */
export function toHexColor(color: string) {
  if (HEX_RE.test(color)) return color;
  return LEGACY_HEX[color] ?? LEGACY_HEX.blue;
}

/** Warna acak dengan saturasi dan kecerahan tetap, supaya hasilnya selalu enak dilihat. */
export function randomCourseHex() {
  return hslToHex(Math.floor(Math.random() * 360), 70, 55);
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    const value = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255).toString(16).padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/** Gaya untuk blok kalender (`block`) dan ikon daftar (`icon`). */
export function colorOf(color: string): {
  block: CSSProperties;
  icon: CSSProperties;
} {
  const hex = toHexColor(color);
  return {
    block: { borderLeftColor: hex, backgroundColor: `${hex}26`, color: hex },
    icon: { backgroundColor: `${hex}26`, color: hex },
  };
}
