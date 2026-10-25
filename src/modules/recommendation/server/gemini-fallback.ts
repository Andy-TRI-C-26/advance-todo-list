// KODE SERVER SAJA. Jangan diimpor dari komponen "use client".
// (Berisi GEMINI_API_KEY yang tidak boleh sampai ke browser.)
//
// Tugas file ini: memanggil Gemini dan berpindah ke model lain
// kalau modelnya sibuk / kena limit. Ia tidak tahu apa pun soal tugas kuliah.

import { GoogleGenAI } from "@google/genai";

// Urutan = prioritas. Ubah sesuai model yang kamu mau.
const MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3-flash",
];

const COOLDOWN_MS = 60_000; // model yang kena limit dilewati selama 1 menit
const cooldownUntil = new Map<string, number>();

// Status HTTP yang membuat kita pindah ke model berikutnya
const FALLBACK_STATUS = [404, 408, 429, 500, 502, 503, 504];

/** Dilempar oleh pemanggil (parser) jika jawaban model tidak sesuai format. */
export class InvalidResponseError extends Error {}

function getStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/\b(404|408|429|500|502|503|504)\b/);
  return match ? Number(match[1]) : undefined;
}

/**
 * Minta model menjawab dalam JSON, lalu ubah jawabannya dengan `parse`.
 * Jika sebuah model gagal (sibuk / format salah), coba model berikutnya.
 */
export async function generateWithFallback<T>(args: {
  systemPrompt: string;
  contents: string;
  parse: (text: string) => T;
}): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY belum diatur.");
  const ai = new GoogleGenAI({ apiKey });

  const now = Date.now();
  const available = MODELS.filter((m) => (cooldownUntil.get(m) ?? 0) <= now);
  // Kalau semua sedang cooldown, tetap coba semuanya dari awal
  const queue = available.length > 0 ? available : MODELS;

  const failures: string[] = [];

  for (const model of queue) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: args.contents,
        config: {
          systemInstruction: args.systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) throw new InvalidResponseError("Respons kosong");

      return args.parse(text);
    } catch (error) {
      const status = getStatus(error);
      const shouldTryNext =
        error instanceof InvalidResponseError ||
        (status !== undefined && FALLBACK_STATUS.includes(status));

      failures.push(
        `${model}: ${status ?? ""} ${error instanceof Error ? error.message : error}`,
      );

      if (status === 429) {
        cooldownUntil.set(model, Date.now() + COOLDOWN_MS);
      }

      // Error seperti 400/401/403 (key salah, request salah) tidak akan
      // membaik dengan ganti model, jadi langsung hentikan.
      if (!shouldTryNext) {
        console.error("[AI] Error non-recoverable:", failures);
        throw new Error("Terjadi kesalahan pada layanan AI. Coba lagi.");
      }

      console.warn(`[AI] ${model} gagal, mencoba model berikutnya...`);
    }
  }

  console.error("[AI] Semua model gagal:", failures);
  throw new Error(
    "Semua model AI sedang sibuk atau terkena limit. Coba lagi beberapa saat.",
  );
}
