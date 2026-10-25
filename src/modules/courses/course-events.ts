import { createEmitter } from "@/shared/lib/emitter";

// Event yang dipancarkan modul `courses` agar modul lain bisa bereaksi
// tanpa `courses` harus mengimpor mereka.
const courseDeleted = createEmitter<{ courseId: string }>();

export const emitCourseDeleted = courseDeleted.emit;

/** Dengarkan penghapusan mata kuliah. Mengembalikan fungsi untuk berhenti. */
export const onCourseDeleted = courseDeleted.on;
