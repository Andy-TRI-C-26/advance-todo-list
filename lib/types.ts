export type Task = { id: string; title: string; courseId: string; deadline: string; hours: number; priority: 'Tinggi' | 'Sedang' | 'Rendah'; completed?: boolean }
export type Course = { id: string; name: string; day: string; start: string; end: string; room: string; lecturer: string; color: string }
export type Settings = { name: string; sleepStart: string; sleepEnd: string; dark: boolean; driveConnected: boolean; lastBackup?: string }
export type Data = { tasks: Task[]; courses: Course[]; settings: Settings }
export type Slot = { taskId: string; start: Date; end: Date }
export type ToastType = 'urgent' | 'warn' | 'success'
export type Toast = { id: number; msg: string; type: ToastType }
export type DT = { y: number; m: number; d: number; h: number; mi: number };
