"use server";
// Server Action: dipanggil dari browser, tetapi dijalankan di server.
// Catatan: file "use server" hanya boleh meng-export fungsi async.

import type { Recommendation, RecommendationPayload } from "../types";
import { generateWithFallback, InvalidResponseError } from "./gemini-fallback";

const SYSTEM_PROMPT =
  'Kamu adalah asisten penjadwalan mahasiswa berbahasa Indonesia. Rekomendasikan satu slot kerja paling realistis dengan prinsip Earliest Deadline First. Hindari jam kuliah dan jam tidur 22.00-05.00. Jawab HANYA JSON stringified valid tanpa markdown dengan bentuk {"waktu":"DDDD, DD MMMM YYYY - HH:MM","alasan":"..."}.';

/** Ubah teks jawaban AI menjadi { waktu, alasan }. Salah format -> InvalidResponseError. */
function parseRecommendation(text: string): Recommendation {
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
      waktu?: string;
      alasan?: string;
    };
    if (!parsed.waktu || !parsed.alasan) throw new Error();
    return { waktu: parsed.waktu, alasan: parsed.alasan };
  } catch {
    throw new InvalidResponseError("Format JSON tidak valid");
  }
}

export async function getTaskRecommendation(
  payload: RecommendationPayload,
): Promise<Recommendation> {
  return generateWithFallback({
    systemPrompt: SYSTEM_PROMPT,
    contents: JSON.stringify(payload),
    parse: parseRecommendation,
  });
}
