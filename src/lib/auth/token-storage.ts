const ACCESS_TOKEN_KEY = "realityng.accessToken";
const REFRESH_TOKEN_KEY = "realityng.refreshToken";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
