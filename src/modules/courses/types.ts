export type Course = {
  id: string;
  name: string;
  day: string; // "Senin" ... "Minggu"
  start: string; // "08:00"
  end: string; // "09:40"
  room: string;
  lecturer: string;
  color: string; // kunci di COURSE_COLORS
};
