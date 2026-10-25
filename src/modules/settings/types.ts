export type Settings = {
  name: string;
  sleepStart: string; // "22:00"
  sleepEnd: string; // "05:00"
  dark: boolean;
  driveConnected: boolean;
  lastBackup?: string; // ISO string
};
