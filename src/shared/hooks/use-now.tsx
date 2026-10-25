"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Satu jam bersama untuk seluruh aplikasi, diperbarui tiap menit.
// Dengan begitu cukup ada satu timer, berapa pun komponen yang butuh "sekarang".

const NowContext = createContext<Date | null>(null);

export function NowProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return <NowContext.Provider value={now}>{children}</NowContext.Provider>;
}

export function useNow() {
  const now = useContext(NowContext);
  if (!now) throw new Error("useNow harus dipakai di dalam <NowProvider>");
  return now;
}
