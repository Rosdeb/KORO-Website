import { broadcastLoggedOut, getAccessToken, setAccessToken } from "@/lib/auth/token-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const API_PREFIX = "/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (failureCount >= 1 || error.name === "AbortError") return false;
  // Repeating validation, permission, or missing-resource requests cannot help.
  return !(error instanceof ApiError) || error.status === 408 || error.status >= 500;
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
    // Call our same-origin Next.js proxy (src/app/api/auth/refresh/route.ts).
    // It reads the httpOnly refresh cookie and forwards { refreshToken } to
    // the backend's POST /api/v1/auth/refresh endpoint.
    refreshPromise = fetch("/api/auth/refresh", { method: "POST", signal: AbortSignal.timeout(15_000) })
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
  const controller = new AbortController();
  const abort = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted) abort();
  else options.signal?.addEventListener("abort", abort, { once: true });
  // Allow uploads and generated exports more time than ordinary reads.
  const timeout = setTimeout(() => controller.abort(), options.method === "GET" ? 30_000 : 120_000);
  try {
    return await performRequest<T>(path, { ...options, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted && !options.signal?.aborted) {
      throw new ApiError("The request took too long. Please try again.", 408);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
}

async function performRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const { body, auth = false, isFormData = false, skipRetryOn401 = false, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !isFormData && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  // The backend requires a bearer token on nearly every endpoint (see
  // security: bearerAuth in the OpenAPI doc), so attach it whenever we have
  // one — not just on calls explicitly flagged `auth`.
  const token = getAccessToken();
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 401) {
    // Only attempt a silent refresh if this call actually had a token to
    // begin with — otherwise it's just an anonymous visitor hitting an
    // endpoint that requires login, not an expired session.
    if (auth && token && !skipRetryOn401) {
      const newToken = await refreshAccessToken();
      options.signal?.throwIfAborted();
      if (newToken) {
        return performRequest<T>(path, { ...options, skipRetryOn401: true });
      }
      broadcastLoggedOut();
      throw new ApiError("Session expired. Please log in again.", 401);
    }
    throw new ApiError("Please log in to continue.", 401);
  }

  if (!res.ok) {
    // Most error bodies are `{ message }`, but some (e.g. the submissions
    // duplicate-word 409) are a bare JSON string — handle both.
    const message = await res
      .json()
      .then((data: unknown) => {
        if (typeof data === "string") return data;
        if (data && typeof data === "object" && "message" in data) {
          return (data as { message?: string }).message;
        }
        return undefined;
      })
      .catch(() => undefined);
    throw new ApiError(message ?? "Something went wrong. Please try again.", res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// File URLs the backend returns (scanned images, generated PDFs) are host-
// relative paths served by the API, not the Next.js origin — resolve them
// against API_BASE_URL so <img src> / downloads point at the right server.
export function resolveApiFileUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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
