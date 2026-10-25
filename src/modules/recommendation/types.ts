/** Data yang dikirim ke AI. Sengaja hanya berisi teks/angka sederhana. */
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

/** Jawaban AI. */
export type Recommendation = {
  waktu: string; // contoh: "Senin, 26 Oktober 2026 - 19:00"
  alasan: string;
};
