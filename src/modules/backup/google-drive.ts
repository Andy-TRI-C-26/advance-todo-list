// Backup ke Google Drive pengguna, di folder tersembunyi "appDataFolder"
// (aplikasi lain dan pengguna tidak melihatnya di Drive biasa).
// Butuh NEXT_PUBLIC_GOOGLE_CLIENT_ID di .env.
//
// File ini murni urusan Google Drive. Ia tidak tahu isi datanya (tugas, kuliah, ...).

declare global {
  interface Window {
    // Disuntikkan oleh script Google Identity Services
    google: any;
  }
}

const SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const FILE_NAME = "nugas-in.json";
const MULTIPART_BOUNDARY = "nugasin";

/** Token akses Google (berlaku sekitar 1 jam). Disimpan di memori saja. */
let accessToken: string | null = null;

class TokenExpiredError extends Error {}

/** Lempar TokenExpiredError jika Google menjawab 401. */
function assertNotExpired(response: Response) {
  if (response.status === 401) throw new TokenExpiredError();
  return response;
}

const authHeader = () => ({ Authorization: `Bearer ${accessToken}` });

// ---------- Login ----------

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts) return resolve();
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Google Sign-In"));
    document.head.appendChild(script);
  });
}

/** Munculkan popup login Google. Mengembalikan token akses. */
export async function signIn() {
  await loadGoogleScript();
  return new Promise<string>((resolve, reject) =>
    window.google.accounts.oauth2
      .initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: SCOPE,
        callback: (response: any) => {
          if (response.access_token) {
            accessToken = response.access_token;
            resolve(response.access_token);
          } else {
            reject(new Error(response.error || "Login Google dibatalkan"));
          }
        },
      })
      .requestAccessToken(),
  );
}

/** Jalankan `action`; kalau token kedaluwarsa, login ulang lalu coba sekali lagi. */
async function withToken<T>(action: () => Promise<T>): Promise<T> {
  if (!accessToken) await signIn();
  try {
    return await action();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      accessToken = null;
      await signIn();
      return action();
    }
    throw error;
  }
}

// ---------- Operasi file ----------

/** Id file backup di Drive, atau undefined jika belum pernah backup. */
async function findBackupFileId(): Promise<string | undefined> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%3D'${FILE_NAME}'&fields=files(id)`,
    { headers: authHeader() },
  );
  assertNotExpired(response);
  return (await response.json()).files?.[0]?.id;
}

export function uploadBackup(data: unknown) {
  return withToken(async () => {
    const existingId = await findBackupFileId();

    // Upload "multipart": bagian 1 = metadata file, bagian 2 = isi file
    const metadata = {
      name: FILE_NAME,
      ...(existingId ? {} : { parents: ["appDataFolder"] }),
    };
    const body =
      `--${MULTIPART_BOUNDARY}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${MULTIPART_BOUNDARY}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n` +
      `--${MULTIPART_BOUNDARY}--`;

    const response = assertNotExpired(
      await fetch(
        `https://www.googleapis.com/upload/drive/v3/files${existingId ? "/" + existingId : ""}?uploadType=multipart`,
        {
          method: existingId ? "PATCH" : "POST", // ada -> timpa, belum -> buat baru
          headers: {
            ...authHeader(),
            "Content-Type": `multipart/related; boundary=${MULTIPART_BOUNDARY}`,
          },
          body,
        },
      ),
    );
    if (!response.ok) throw new Error("Upload ke Google Drive gagal");
  });
}

/** Ambil isi backup. Mengembalikan null jika belum pernah backup. */
export function downloadBackup() {
  return withToken(async () => {
    const id = await findBackupFileId();
    if (!id) return null;

    const response = assertNotExpired(
      await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
        headers: authHeader(),
      }),
    );
    return response.json();
  });
}
