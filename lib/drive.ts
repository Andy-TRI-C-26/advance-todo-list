declare global {
  interface Window {
    google: any;
  }
}

class TokenKedaluwarsa extends Error {}
const cekRespons = (r: Response) => {
  if (r.status === 401) throw new TokenKedaluwarsa();
  return r;
};

// Backup ke Google Drive pengguna (folder tersembunyi appDataFolder). Butuh NEXT_PUBLIC_GOOGLE_CLIENT_ID.
const SCOPE = "https://www.googleapis.com/auth/drive.appdata",
  NAMA = "nugas-in.json";
let token: string | null = null;
const muatGsi = () =>
  new Promise<void>((ok) => {
    if (window.google?.accounts) return ok();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = () => ok();
    document.head.appendChild(s);
  });
export async function masuk() {
  await muatGsi();
  return new Promise<string>((ok, gagal) =>
    window.google.accounts.oauth2
      .initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: SCOPE,
        callback: (r: any) =>
          r.access_token
            ? ((token = r.access_token), ok(r.access_token))
            : gagal(new Error(r.error || "Login Google dibatalkan")),
      })
      .requestAccessToken(),
  );
}
const H = () => ({ Authorization: `Bearer ${token}` });

async function cariFile() {
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%3D'${NAMA}'&fields=files(id)`,
    { headers: H() },
  );
  if (r.status === 401) throw new TokenKedaluwarsa();
  return (await r.json()).files?.[0]?.id;
}

async function denganToken<T>(fn: () => Promise<T>): Promise<T> {
  if (!token) await masuk();
  try {
    return await fn();
  } catch (e) {
    if (e instanceof TokenKedaluwarsa) {
      token = null;
      await masuk();
      return fn();
    }
    throw e;
  }
}


export async function backup(data: unknown) {
  return denganToken(async () => {
    const id = await cariFile(),
      b = "nugasin";
    const meta = { name: NAMA, ...(id ? {} : { parents: ["appDataFolder"] }) };
    const body = `--${b}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n--${b}--`;
    const r = cekRespons(
      await fetch(
        `https://www.googleapis.com/upload/drive/v3/files${id ? "/" + id : ""}?uploadType=multipart`,
        {
          method: id ? "PATCH" : "POST",
          headers: {
            ...H(),
            "Content-Type": `multipart/related; boundary=${b}`,
          },
          body,
        },
      ),
    );
    if (!r.ok) throw new Error("Upload ke Google Drive gagal");
  });
}
export async function pulihkan() {
  return denganToken(async () => {
    const id = await cariFile();
    if (!id) return null;
    const r = cekRespons(
      await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
        headers: H(),
      }),
    );
    return r.json();
  });
}
