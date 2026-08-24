import { broadcastLoggedOut, getAccessToken, setAccessToken } from "@/lib/auth/token-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  isFormData?: boolean;
  skipRetryOn401?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { accessToken: string };
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, isFormData = false, skipRetryOn401 = false, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (!isFormData) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 401 && auth && !skipRetryOn401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, { ...options, skipRetryOn401: true });
    }
    broadcastLoggedOut();
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (!res.ok) {
    const message = await res
      .json()
      .then((data: { message?: string }) => data.message)
      .catch(() => undefined);
    throw new ApiError(message ?? "Something went wrong. Please try again.", res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
