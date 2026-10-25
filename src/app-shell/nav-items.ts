import {
  BrainCircuit,
  CalendarDays,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rekomendasi", label: "Rekomendasi AI", icon: BrainCircuit },
  { href: "/jadwal", label: "Jadwal Kuliah", icon: CalendarDays },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
] as const;
