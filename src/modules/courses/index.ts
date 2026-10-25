// API publik modul `courses`. Modul lain hanya boleh import dari sini.
export { CoursesProvider, useCourses } from "./courses-provider";
export { CourseListPage } from "./components/course-list-page";
export { onCourseDeleted } from "./course-events";
export { colorOf } from "./course-colors";
export type { Course } from "./types";
