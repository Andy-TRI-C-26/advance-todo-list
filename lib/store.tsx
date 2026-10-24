'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Course, Data, Settings, Task, Toast, ToastType } from './types'
import { schedule, toLocalInput } from './schedule'

const KEY = 'nugas-in:v1'
const DEF: Settings = { name: 'Mahasiswa', sleepStart: '22:00', sleepEnd: '05:00', dark: false, driveConnected: false }
const upsert = <T extends { id: string }>(a: T[], x: T) => (a.some((i) => i.id === x.id) ? a.map((i) => (i.id === x.id ? x : i)) : [...a, x])

function seed(): Data { // contoh data awal (deadline relatif terhadap hari ini)
  const at = (d: number, h: number) => { const x = new Date(); x.setDate(x.getDate() + d); x.setHours(h, 0, 0, 0); return toLocalInput(x) }
  return {
    settings: DEF,
    courses: [],
    tasks: [],
  }
}

type Ctx = {
  ready: boolean; now: Date; data: Data; plan: ReturnType<typeof schedule>; toasts: Toast[]
  toast: (msg: string, type: ToastType) => void
  saveTask: (t: Task) => void; toggleTask: (id: string) => void; delTask: (id: string) => void
  saveCourse: (c: Course) => void; delCourse: (id: string) => void
  setSettings: (s: Partial<Settings>) => void; replaceAll: (d: Data) => void; reset: () => void
}
const C = createContext<Ctx | null>(null)
export const useData = () => { const c = useContext(C); if (!c) throw new Error('useData harus di dalam DataProvider'); return c }

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(() => seed())
  const [ready, setReady] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) { const p = JSON.parse(s); if (p?.tasks && p?.courses) setData({ ...p, settings: { ...DEF, ...p.settings } }) } } catch {}
    setReady(true)
  }, [])
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(data)) }, [data, ready])
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 6e4); return () => clearInterval(i) }, [])

  const plan = useMemo(() => schedule(data.tasks, data.courses, data.settings.sleepStart, data.settings.sleepEnd, now), [data, now])
  const toast = useCallback((msg: string, type: ToastType) => {
    const id = Math.random(); setToasts((t) => [...t, { id, msg, type }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000)
  }, [])

  const once = useRef(false)
  useEffect(() => { // pengingat deadline mendesak (< 24 jam), sekali saat aplikasi dibuka
    if (!ready || once.current) return; once.current = true
    data.tasks.filter((t) => { const s = +new Date(t.deadline) - +now; return !t.completed && s > 0 && s < 864e5 })
      .forEach((t) => toast(`Deadline mendesak: ${t.title} (kurang dari 24 jam)`, 'urgent'))
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps
  const kunci = Object.keys(plan.short).join()
  useEffect(() => { if (ready && kunci) toast('Waktu luang terbatas! Prinsipnya: yang penting selesai daripada bagus.', 'warn') }, [kunci, ready, toast])

  const value: Ctx = {
    ready, now, data, plan, toasts, toast,
    saveTask: (t) => setData((d) => ({ ...d, tasks: upsert(d.tasks, t) })),
    toggleTask: (id) => setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) })),
    delTask: (id) => setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) })),
    saveCourse: (c) => setData((d) => ({ ...d, courses: upsert(d.courses, c) })),
    delCourse: (id) => setData((d) => ({ ...d, courses: d.courses.filter((c) => c.id !== id), tasks: d.tasks.map((t) => (t.courseId === id ? { ...t, courseId: '' } : t)) })),
    setSettings: (s) => setData((d) => ({ ...d, settings: { ...d.settings, ...s } })),
    replaceAll: (d) => setData({ ...d, settings: { ...DEF, ...d.settings } }),
    reset: () => setData({ tasks: [], courses: [], settings: data.settings }),
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
