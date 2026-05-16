const KEY = "hcm_hr_auth";

export function isHrAuthed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function loginHr() {
  try { window.localStorage.setItem(KEY, "1"); } catch {}
}

export function logoutHr() {
  try { window.localStorage.removeItem(KEY); } catch {}
}
