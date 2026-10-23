'use server'

import { generateText } from 'ai'

export type RecommendationPayload = {
  selectedTask: { title: string; course: string; deadline: string; hours: number }
  otherTasks: Array<{ title: string; deadline: string; hours: number; completed?: boolean }>
  courses: Array<{ name: string; day: string; start: string; end: string }>
  constraints: { sleepStart: string; sleepEnd: string; operatingStart: string; operatingEnd: string }
}

export async function getTaskRecommendation(payload: RecommendationPayload) {
  const { text } = await generateText({
    model: 'google/gemini-3.5-flash',
    system: 'Kamu adalah asisten penjadwalan mahasiswa berbahasa Indonesia. Rekomendasikan satu slot kerja paling realistis dengan prinsip Earliest Deadline First. Hindari jam kuliah dan jam tidur 22.00-05.00. Jawab HANYA JSON stringified valid tanpa markdown dengan bentuk {"waktu":"...","alasan":"..."}.',
    prompt: JSON.stringify(payload),
  })

  try {
    const parsed = JSON.parse(text) as { waktu?: string; alasan?: string }
    if (!parsed.waktu || !parsed.alasan) throw new Error('Format rekomendasi tidak lengkap')
    return parsed
  } catch {
    throw new Error('AI mengembalikan format yang tidak valid. Coba lagi.')
  }
}
