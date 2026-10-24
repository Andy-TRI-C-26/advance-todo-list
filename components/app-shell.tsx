'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { BrainCircuit, CalendarDays, Check, LayoutDashboard, Menu, Moon, Settings, Sparkles, Sun, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useData } from '@/lib/store'
import { AppLogo } from './common'

const NAV = [['/', 'Dashboard', LayoutDashboard], ['/rekomendasi', 'Rekomendasi AI', BrainCircuit], ['/jadwal', 'Jadwal Kuliah', CalendarDays], ['/pengaturan', 'Pengaturan', Settings]] as const
const TOAST = { urgent: 'bg-red-600', warn: 'bg-amber-500', success: 'bg-slate-900' }
const box = 'grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, data, plan, now, toasts, setSettings } = useData()
  const path = usePathname(), [open, setOpen] = useState(false)
  if (!ready) return <div className="grid min-h-screen place-items-center text-sm text-slate-400">Memuat nugas.in...</div>
  const { dark, name } = data.settings
  const total = data.tasks.filter((t) => !t.completed).reduce((s, t) => s + t.hours, 0)
  const short = Object.values(plan.short).reduce((a, b) => a + b, 0) / 60
  const pct = total ? Math.max(0, Math.round((1 - short / total) * 100)) : 100
  const h = now.getHours(), sapa = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam'
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'M'
  return <div className={cn('min-h-screen bg-[#f6f7fb] text-slate-950', dark && 'dark bg-slate-950 text-slate-50')}>
    <aside className={cn('fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
      <div className="mb-10 flex items-center justify-between px-2"><AppLogo /><button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup menu"><X /></button></div>
      <nav className="flex flex-1 flex-col gap-1.5">{NAV.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-colors', path === href ? 'bg-primary text-primary-foreground shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800')}><Icon className="size-[18px]" />{label}</Link>)}</nav>
      <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/40"><div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900"><Sparkles className="size-4" /></div><p className="text-sm font-semibold">Fokus saat ini</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{total ? `Kamu punya ${total} jam tugas yang perlu diselesaikan.` : 'Tidak ada tugas aktif. Santai dulu!'}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} /></div><p className="mt-2 text-[11px] text-slate-500">{pct}% waktu teralokasi</p></div>
      <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800"><div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-xs text-slate-400">Mahasiswa aktif</p></div></div>
    </aside>
    {open && <button className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup navigasi" />}
    <main className="min-h-screen lg:pl-64">
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/80 bg-[#f6f7fb]/90 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
        <div className="flex items-center gap-3"><button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu"><Menu /></button><div><p className="text-sm text-slate-500">Selamat {sapa}, {name.split(' ')[0]}</p><h1 className="text-lg font-bold">{NAV.find((n) => n[0] === path)?.[1] ?? 'nugas.in'}</h1></div></div>
        <button onClick={() => setSettings({ dark: !dark })} className={box} aria-label="Ganti tema">{dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</button>
      </header>
      <div className="mx-auto max-w-[1500px] p-5 sm:p-8">{children}</div>
    </main>
    <div className="fixed bottom-5 right-5 z-[60] space-y-2">{toasts.map((t) => <div key={t.id} className={cn('flex max-w-xs items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg', TOAST[t.type])}>{t.type === 'success' && <Check className="size-4 text-emerald-400" />}{t.msg}</div>)}</div>
  </div>
}
