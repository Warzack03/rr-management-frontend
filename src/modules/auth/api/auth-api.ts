import { httpClient } from "../../../shared/api/http-client";
import type { AuthUser } from "../../../shared/types/api";

type LoginRequest = {
  username: string;
  password: string;
};

export function login(request: LoginRequest) {
  return httpClient<AuthUser>("/auth/login", {
    method: "POST",
    body: request
  });
}

export function logout() {
  return httpClient<{ message: string }>("/auth/logout", {
    method: "POST"
  });
}

export function getCurrentUser(signal?: AbortSignal) {
  return httpClient<AuthUser>("/auth/me", { signal });
}
