// `blk` = warna blok di kalender, `ico` = warna ikon di daftar.
export const COURSE_COLORS: Record<string, { blk: string; ico: string }> = {
  blue: {
    blk: "border-indigo-500 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200",
    ico: "bg-indigo-100 text-indigo-600",
  },
  violet: {
    blk: "border-violet-500 bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200",
    ico: "bg-violet-100 text-violet-600",
  },
  rose: {
    blk: "border-rose-500 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
    ico: "bg-rose-100 text-rose-600",
  },
  amber: {
    blk: "border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    ico: "bg-amber-100 text-amber-600",
  },
};

/** Ambil warna berdasarkan kunci; kunci tak dikenal -> biru. */
export const colorOf = (key: string) =>
  COURSE_COLORS[key] ?? COURSE_COLORS.blue;
