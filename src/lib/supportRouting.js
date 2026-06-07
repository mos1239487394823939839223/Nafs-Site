export const BLACKMAIL_SUPPORT_USER_ID_STORAGE_KEY = "nafs:blackmail_support_user_id";

export function getConfiguredBlackmailSupportUserId() {
  const envValue = import.meta.env.VITE_BLACKMAIL_SUPPORT_USER_ID;
  if (envValue) return String(envValue).trim();

  try {
    return String(localStorage.getItem(BLACKMAIL_SUPPORT_USER_ID_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function setConfiguredBlackmailSupportUserId(userId) {
  try {
    const value = String(userId || "").trim();
    if (value) {
      localStorage.setItem(BLACKMAIL_SUPPORT_USER_ID_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(BLACKMAIL_SUPPORT_USER_ID_STORAGE_KEY);
    }
  } catch {
    // Keep routing payload-only if browser storage is unavailable.
  }
}
