export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  description?: string;
  conceptCount?: number;
  translationCount?: number;
  popular?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  conceptCount?: number;
}

export interface Translation {
  languageCode: string;
  languageName: string;
  text: string;
  pronunciation?: string;
  example?: string;
}

export interface Concept {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categorySlug: string;
  imageUrl?: string;
  translations: Translation[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  nativeLanguage?: string;
  preferredLanguage?: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Book {
  id: string;
  title: string;
  description?: string;
  wordCount: number;
  updatedAt: string;
  chapters?: BookChapter[];
}

export interface BookChapter {
  id: string;
  title: string;
  items: BookItem[];
}

export interface BookItem {
  id: string;
  conceptId: string;
  conceptName: string;
  languageCode: string;
  translationText: string;
  pronunciation?: string;
  note?: string;
}

export interface ExportRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  languageCode: string;
  fileUrl: string;
  createdAt: string;
}

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Submission {
  id: string;
  conceptId: string;
  conceptName: string;
  languageCode: string;
  languageName: string;
  suggestedText: string;
  pronunciation?: string;
  note?: string;
  status: SubmissionStatus;
  reviewNote?: string;
  createdAt: string;
}

export interface ScanResult {
  id: string;
  imageUrl: string;
  detectedLabel: string;
  confidence: number;
  conceptId?: string;
  conceptName?: string;
  translations: Translation[];
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  type: "SEARCH" | "SAVE" | "SCAN" | "SUBMISSION" | "BOOK" | "EXPORT";
  description: string;
  createdAt: string;
}

export interface ActivityStatistics {
  searches: number;
  savedWords: number;
  books: number;
  scans: number;
  contributions: number;
  series: { date: string; count: number }[];
}

export interface SearchResults {
  languages: Language[];
  concepts: Concept[];
  categories: Category[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}
