import type { ApiError } from "../types/api";

const DEFAULT_API_BASE_URL = "http://localhost:9081/api/v1";

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

function isLoopbackHostname(hostname: string) {
  const normalizedHostname = hostname.trim().toLowerCase();
  return normalizedHostname === "localhost" || normalizedHostname === "127.0.0.1" || normalizedHostname === "::1";
}

function resolveApiBaseUrl() {
  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const baseUrl = normalizeBaseUrl(configuredApiBaseUrl && configuredApiBaseUrl.length > 0 ? configuredApiBaseUrl : DEFAULT_API_BASE_URL);

  if (typeof window === "undefined") {
    return baseUrl;
  }

  try {
    const apiUrl = new URL(baseUrl);
    const appHostname = window.location.hostname;

    if (!appHostname || isLoopbackHostname(appHostname) || !isLoopbackHostname(apiUrl.hostname)) {
      return baseUrl;
    }

    apiUrl.hostname = appHostname;
    return normalizeBaseUrl(apiUrl.toString());
  } catch {
    return baseUrl;
  }
}

const API_BASE_URL = resolveApiBaseUrl();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
};

export class HttpClientError extends Error {
  readonly status: number;
  readonly payload: ApiError | null;

  constructor(status: number, payload: ApiError | null) {
    super(payload?.message ?? `Request failed with status ${status}`);
    this.name = "HttpClientError";
    this.status = status;
    this.payload = payload;
  }
}

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal
  });

  if (!response.ok) {
    let payload: ApiError | null = null;

    try {
      payload = (await response.json()) as ApiError;
    } catch {
      payload = null;
    }

    throw new HttpClientError(response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
