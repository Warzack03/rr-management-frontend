const AUTH_TOKEN_STORAGE_KEY = "rr-management.auth.access-token";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

export function getAuthToken() {
  return getStorage()?.getItem(AUTH_TOKEN_STORAGE_KEY) ?? null;
}

export function hasAuthToken() {
  return getAuthToken() !== null;
}

export function storeAuthToken(token: string) {
  getStorage()?.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  getStorage()?.removeItem(AUTH_TOKEN_STORAGE_KEY);
}
