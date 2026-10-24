"use server";

import { GoogleGenAI } from "@google/genai";

export type RecommendationPayload = {
  selectedTask: {
    title: string;
    course: string;
    deadline: string;
    hours: number;
  };
  otherTasks: Array<{
    title: string;
    deadline: string;
    hours: number;
    completed?: boolean;
  }>;
  courses: Array<{ name: string; day: string; start: string; end: string }>;
  constraints: {
    sleepStart: string;
    sleepEnd: string;
    operatingStart: string;
    operatingEnd: string;
  };
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Urutan = prioritas. Ubah sesuai model yang kamu mau.
// Catatan: file "use server" hanya boleh meng-export fungsi async,
// jadi konstanta ini sengaja tidak di-export.
const MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3-flash",
  "gemini-3.8-flash"
];

const COOLDOWN_MS = 60_000; // model yang kena limit dilewati selama 1 menit
const cooldownUntil = new Map<string, number>();

// Status HTTP yang membuat kita pindah ke model berikutnya
const FALLBACK_STATUS = [404, 408, 429, 500, 502, 503, 504];

const SYSTEM_PROMPT =
  'Kamu adalah asisten penjadwalan mahasiswa berbahasa Indonesia. Rekomendasikan satu slot kerja paling realistis dengan prinsip Earliest Deadline First. Hindari jam kuliah dan jam tidur 22.00-05.00. Jawab HANYA JSON stringified valid tanpa markdown dengan bentuk {"waktu":"DDDD, DD MMMM YYYY - HH:MM","alasan":"..."}.';

class FormatError extends Error {}

function getStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/\b(404|408|429|500|502|503|504)\b/);
  return match ? Number(match[1]) : undefined;
}

function parseRecommendation(text: string) {
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
      waktu?: string;
      alasan?: string;
    };
    if (!parsed.waktu || !parsed.alasan) throw new Error();
    return { waktu: parsed.waktu, alasan: parsed.alasan };
  } catch {
    throw new FormatError("Format JSON tidak valid");
  }
}

export async function getTaskRecommendation(payload: RecommendationPayload) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY belum diatur.");
  }

  const now = Date.now();
  const ready = MODELS.filter((m) => (cooldownUntil.get(m) ?? 0) <= now);
  // Kalau semua sedang cooldown, tetap coba semuanya dari awal
  const queue = ready.length > 0 ? ready : MODELS;

  const failures: string[] = [];

  for (const model of queue) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: JSON.stringify(payload),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) throw new FormatError("Respons kosong");

      return parseRecommendation(text);
    } catch (error) {
      const status = getStatus(error);
      const shouldFallback =
        error instanceof FormatError ||
        (status !== undefined && FALLBACK_STATUS.includes(status));

      failures.push(
        `${model}: ${status ?? ""} ${error instanceof Error ? error.message : error}`,
      );

      if (status === 429) {
        cooldownUntil.set(model, Date.now() + COOLDOWN_MS);
      }

      // Error seperti 400/401/403 (key salah, request salah) tidak akan
      // membaik dengan ganti model, jadi langsung hentikan.
      if (!shouldFallback) {
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
