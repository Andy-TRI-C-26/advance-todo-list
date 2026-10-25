/** Sisa hari sampai deadline (dibulatkan ke atas). */
export const daysLeft = (deadline: string, now: Date) =>
  Math.ceil((+new Date(deadline) - +now) / 864e5);

/** Sisa jam sampai deadline (negatif = sudah lewat). */
export const hoursLeft = (deadline: string, now: Date) =>
  (+new Date(deadline) - +now) / 36e5;

/** Urutkan dari deadline paling dekat (dipakai .sort). */
export const byDeadline = (a: { deadline: string }, b: { deadline: string }) =>
  +new Date(a.deadline) - +new Date(b.deadline);
