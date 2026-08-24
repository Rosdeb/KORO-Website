/**
 * Typed calls onto the Koro backend, grouped by resource. Paths and payload
 * shapes are taken directly from the live OpenAPI doc at
 * http://localhost:8080/v3/api-docs (Koro API 1.0.0) — verified against the
 * running server, since several response bodies are typed as generic
 * `object` in the spec itself. All paths here are relative to /api/v1,
 * which `apiClient` prefixes automatically.
 *
 * Return types are the *raw* backend shapes (see ./raw-types), not the
 * polished view models in @/types — the backend has no slug fields and
 * only carries languageId/languageName (not the short `code`) on nested
 * translations. Feature hooks turn these into view models via ./mappers,
 * joining in the language code where needed.
 */
import { apiClient } from "./client";
import type {
  RawActivityLog,
  RawActivityStatistics,
  RawCategory,
  RawCollection,
  RawCollectionItem,
  RawConcept,
  RawLanguage,
  RawPdfExport,
  RawScanResult,
  RawSubmission,
  RawTranslation,
  RawUser,
} from "./raw-types";

// Auth calls go through this app's own /api/auth/* route handlers (same
// origin, not the external API_BASE_URL) so the refresh token can be set as
// an httpOnly cookie the browser JS never touches.
async function sameOriginPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const message = await res
      .json()
      .then((data: { message?: string }) => data.message)
      .catch(() => undefined);
    throw new Error(message ?? "Something went wrong. Please try again.");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const authApi = {
  login: (email: string, password: string) =>
    sameOriginPost<{ accessToken: string; user: RawUser }>("/api/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    sameOriginPost<{ message: string }>("/api/auth/register", { name, email, password }),
  forgotPassword: (email: string) => sameOriginPost<{ message: string }>("/api/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    sameOriginPost<{ message: string }>("/api/auth/reset-password", { token, newPassword: password }),
  logout: () => sameOriginPost<void>("/api/auth/logout"),
};

export const languagesApi = {
  list: () => apiClient.get<RawLanguage[]>("/languages", { auth: true }),
  getById: (id: string) => apiClient.get<RawLanguage>(`/languages/${id}`, { auth: true }),
};

export const categoriesApi = {
  list: () => apiClient.get<RawCategory[]>("/categories", { auth: true }),
};

export const conceptsApi = {
  list: (categoryId?: string) =>
    apiClient.get<RawConcept[]>(`/concepts${toQuery({ categoryId })}`, { auth: true }),
  getById: (id: string) => apiClient.get<RawConcept>(`/concepts/${id}`, { auth: true }),
};

export const translationsApi = {
  list: (params?: { conceptId?: string; languageId?: string }) =>
    apiClient.get<RawTranslation[]>(`/translations${toQuery(params)}`, { auth: true }),
  search: (payload: { sourceLanguageId?: string; targetLanguageId: string; query: string }) =>
    apiClient.post<RawTranslation[]>("/translations/search", payload, { auth: true }),
};

export const collectionsApi = {
  list: () => apiClient.get<RawCollection[]>("/collections", { auth: true }),
  create: (name: string, description?: string) =>
    apiClient.post<RawCollection>("/collections", { name, description }, { auth: true }),
  update: (id: string, name: string, description?: string) =>
    apiClient.put<RawCollection>(`/collections/${id}`, { name, description }, { auth: true }),
  remove: (id: string) => apiClient.delete<void>(`/collections/${id}`, { auth: true }),
  getById: (id: string) => apiClient.get<RawCollection>(`/collections/${id}`, { auth: true }),
  addItem: (
    collectionId: string,
    payload: { conceptId: string; languageId: string; notes?: string; chapter?: string; displayOrder?: number },
  ) => apiClient.post<RawCollectionItem>(`/collections/${collectionId}/items`, payload, { auth: true }),
  removeItem: (collectionId: string, itemId: string) =>
    apiClient.delete<void>(`/collections/${collectionId}/items/${itemId}`, { auth: true }),
};

export const exportApi = {
  toPdf: (payload: { collectionId: string; languageId: string }) =>
    apiClient.post<RawPdfExport>("/export/pdf", payload, { auth: true }),
  history: () => apiClient.get<RawPdfExport[]>("/export/history", { auth: true }),
};

export const imagesApi = {
  recognize: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<RawScanResult>("/images/recognize", form, { auth: true, isFormData: true });
  },
  history: () => apiClient.get<RawScanResult[]>("/images/history", { auth: true }),
};

export const submissionsApi = {
  create: (payload: {
    conceptId: string;
    languageId: string;
    suggestedTranslation: string;
    pronunciation?: string;
    notes?: string;
  }) => apiClient.post<RawSubmission>("/submissions", payload, { auth: true }),
  // GET /submissions returns the current user's own submissions — there is
  // no separate "mine" endpoint.
  mine: () => apiClient.get<RawSubmission[]>("/submissions", { auth: true }),
};

export const activityApi = {
  list: (params?: { from?: string; to?: string }) =>
    apiClient.get<RawActivityLog[]>(`/activity${toQuery(params)}`, { auth: true }),
  statistics: () => apiClient.get<RawActivityStatistics>("/activity/statistics", { auth: true }),
};

export const profileApi = {
  me: () => apiClient.get<RawUser>("/users/profile", { auth: true }),
  update: (payload: { name?: string; avatarUrl?: string; nativeLanguage?: string; preferredLanguage?: string }) =>
    apiClient.put<RawUser>(
      "/users/profile",
      {
        name: payload.name,
        profileImage: payload.avatarUrl,
        nativeLanguage: payload.nativeLanguage,
        preferredLanguage: payload.preferredLanguage,
      },
      { auth: true },
    ),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put<void>("/users/change-password", { oldPassword: currentPassword, newPassword }, { auth: true }),
};

// Admin resource. No UI consumes this yet, but the methods are wired up to
// the real contract (role-gated: ROLE_ADMIN, returns 403 otherwise) so an
// admin dashboard can be built directly on top of it.
export const adminApi = {
  users: {
    list: () => apiClient.get<RawUser[]>("/admin/users", { auth: true }),
    setStatus: (id: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") =>
      apiClient.put<RawUser>(`/admin/users/${id}/status${toQuery({ status })}`, undefined, { auth: true }),
  },
  languages: {
    create: (payload: Partial<RawLanguage>) => apiClient.post<RawLanguage>("/admin/languages", payload, { auth: true }),
    update: (id: string, payload: Partial<RawLanguage>) =>
      apiClient.put<RawLanguage>(`/admin/languages/${id}`, payload, { auth: true }),
    remove: (id: string) => apiClient.delete<void>(`/admin/languages/${id}`, { auth: true }),
  },
  categories: {
    create: (payload: { name: string; description?: string }) =>
      apiClient.post<RawCategory>("/admin/categories", payload, { auth: true }),
  },
  concepts: {
    create: (payload: { name: string; description?: string; categoryId: string; referenceImage?: string }) =>
      apiClient.post<RawConcept>("/admin/concepts", payload, { auth: true }),
  },
  translations: {
    create: (payload: { conceptId: string; languageId: string; text: string; pronunciation?: string; notes?: string }) =>
      apiClient.post<RawTranslation>("/admin/translations", payload, { auth: true }),
  },
  submissions: {
    pending: () => apiClient.get<RawSubmission[]>("/admin/submissions/pending", { auth: true }),
    getById: (id: string) => apiClient.get<RawSubmission>(`/admin/submissions/${id}`, { auth: true }),
    approve: (id: string, reviewerNote?: string) =>
      apiClient.post<RawSubmission>(`/admin/submissions/${id}/approve`, { reviewerNote }, { auth: true }),
    reject: (id: string, reviewerNote?: string) =>
      apiClient.post<RawSubmission>(`/admin/submissions/${id}/reject`, { reviewerNote }, { auth: true }),
  },
  statistics: () => apiClient.get<Record<string, unknown>>("/admin/statistics", { auth: true }),
};

function toQuery(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `?${search.toString()}`;
}
