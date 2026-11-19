/** Data yang dikirim ke AI. Sengaja hanya berisi teks/angka sederhana. */
export type RecommendationPayload = {
  selectedTask: {
    title: string;
    course: string;
    deadline: string;
    hours: number;
    progress: number;
    energy: string;
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
  currentTime: string;
};

/** Jawaban AI. */
export type Recommendation = {
  start: string;
  end: string;
  alasan: string;
  langkah: string[];
};
