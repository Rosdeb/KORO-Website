/**
 * Typed calls onto the Koro backend, grouped by resource. Paths follow the
 * shape documented in the site plan (POST /translations/search, GET
 * /categories, POST /collections/{id}/items, etc). If the backend's actual
 * Swagger contract differs in a field name or nesting, this is the one file
 * to reconcile — nothing above the API layer should need to change.
 */
import { apiClient } from "./client";
import type {
  ActivityEntry,
  ActivityStatistics,
  AuthResponse,
  Book,
  BookItem,
  Category,
  Concept,
  ExportRecord,
  Language,
  Paginated,
  ScanResult,
  SearchResults,
  Submission,
  Translation,
  User,
} from "@/types";

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
    sameOriginPost<AuthResponse>("/api/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    sameOriginPost<AuthResponse>("/api/auth/register", { name, email, password }),
  forgotPassword: (email: string) => sameOriginPost<{ message: string }>("/api/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    sameOriginPost<{ message: string }>("/api/auth/reset-password", { token, password }),
  logout: () => sameOriginPost<void>("/api/auth/logout"),
};

export const languagesApi = {
  list: () => apiClient.get<Language[]>("/languages"),
  getByCode: (code: string) => apiClient.get<Language>(`/languages/${code}`),
};

export const categoriesApi = {
  list: () => apiClient.get<Category[]>("/categories"),
};

export const conceptsApi = {
  listByCategory: (categorySlug: string, params?: { q?: string; page?: number }) =>
    apiClient.get<Paginated<Concept>>(
      `/categories/${categorySlug}/concepts${toQuery(params)}`,
    ),
  getBySlug: (categorySlug: string, conceptSlug: string) =>
    apiClient.get<Concept>(`/categories/${categorySlug}/concepts/${conceptSlug}`),
  popular: () => apiClient.get<Concept[]>("/concepts/popular"),
};

export const translationsApi = {
  search: (payload: { query: string; fromLanguage?: string; toLanguage: string }) =>
    apiClient.post<{ concept: Concept; translation: Translation }[]>("/translations/search", payload),
};

export const searchApi = {
  global: (q: string) => apiClient.get<SearchResults>(`/search${toQuery({ q })}`),
};

export const collectionsApi = {
  list: () => apiClient.get<Book[]>("/collections", { auth: true }),
  create: (title: string, description?: string) =>
    apiClient.post<Book>("/collections", { title, description }, { auth: true }),
  getById: (id: string) => apiClient.get<Book>(`/collections/${id}`, { auth: true }),
  addItem: (
    collectionId: string,
    payload: { conceptId: string; languageCode: string; chapterId?: string; note?: string },
  ) => apiClient.post<BookItem>(`/collections/${collectionId}/items`, payload, { auth: true }),
  removeItem: (collectionId: string, itemId: string) =>
    apiClient.delete<void>(`/collections/${collectionId}/items/${itemId}`, { auth: true }),
  reorderItems: (collectionId: string, orderedItemIds: string[]) =>
    apiClient.patch<void>(`/collections/${collectionId}/items/reorder`, { orderedItemIds }, { auth: true }),
};

export const exportApi = {
  toPdf: (payload: { collectionId: string; languageCode: string }) =>
    apiClient.post<ExportRecord>("/export/pdf", payload, { auth: true }),
  history: () => apiClient.get<ExportRecord[]>("/export/history", { auth: true }),
};

export const imagesApi = {
  recognize: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return apiClient.post<ScanResult>("/images/recognize", form, { auth: true, isFormData: true });
  },
  history: () => apiClient.get<ScanResult[]>("/images/history", { auth: true }),
};

export const submissionsApi = {
  create: (payload: {
    conceptId: string;
    languageCode: string;
    suggestedText: string;
    pronunciation?: string;
    note?: string;
  }) => apiClient.post<Submission>("/submissions", payload, { auth: true }),
  mine: () => apiClient.get<Submission[]>("/submissions/mine", { auth: true }),
};

export const activityApi = {
  list: (params?: { from?: string; to?: string }) =>
    apiClient.get<ActivityEntry[]>(`/activity${toQuery(params)}`, { auth: true }),
  statistics: (params?: { from?: string; to?: string }) =>
    apiClient.get<ActivityStatistics>(`/activity/statistics${toQuery(params)}`, { auth: true }),
};

export const profileApi = {
  me: () => apiClient.get<User>("/users/me", { auth: true }),
  update: (payload: Partial<Pick<User, "name" | "avatarUrl" | "nativeLanguage" | "preferredLanguage">>) =>
    apiClient.patch<User>("/users/me", payload, { auth: true }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<void>("/users/me/password", { currentPassword, newPassword }, { auth: true }),
};

function toQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const search = new URLSearchParams(entries as [string, string][]);
  return `?${search.toString()}`;
}
