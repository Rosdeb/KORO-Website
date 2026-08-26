/**
 * Shapes mirror the live backend contract at http://localhost:8080/v3/api-docs
 * (Koro API 1.0.0). Fields the backend doesn't return (slugs, language codes
 * on nested translations, chapter grouping) are computed client-side in the
 * feature hooks and marked below.
 */

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  region: string;
  active: boolean;
  description?: string | null;
  conceptCount?: number;
}

export interface Category {
  id: string;
  slug: string; // derived from name
  name: string;
  description?: string | null;
  conceptCount?: number;
}

// A translation joined with its language's short `code`, since the backend
// only returns languageId/languageName on TranslationResponse.
export interface Translation {
  id: string;
  languageId: string;
  languageCode: string;
  languageName: string;
  text: string;
  pronunciation?: string | null;
  verified?: boolean;
  notes?: string | null;
}

export interface Concept {
  id: string;
  slug: string; // derived from name
  name: string;
  description?: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string; // derived from categoryName
  imageUrl?: string | null;
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
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface Book {
  id: string;
  title: string;
  description?: string | null;
  items: BookItem[];
  wordCount: number;
  updatedAt: string;
}

export interface BookItem {
  id: string;
  conceptId: string;
  conceptName: string;
  languageId: string;
  languageCode: string;
  translationText: string;
  pronunciation?: string | null;
  note?: string | null;
  chapter?: string | null;
}

export interface ExportRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Submission {
  id: string;
  categoryId: string;
  categoryName: string;
  sourceLanguageId: string;
  sourceLanguageCode: string;
  sourceLanguageName: string;
  sourceWord: string;
  banglaTranslation: string;
  englishTranslation: string;
  pronunciation?: string | null;
  exampleSentence?: string | null;
  note?: string | null;
  status: SubmissionStatus;
  reviewerNote?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  submittedByName?: string;
  submittedByEmail?: string;
}

export interface ScanResult {
  id: string;
  imageUrl: string;
  detectedLabel: string;
  confidence: number;
  conceptId?: string | null;
  conceptName?: string | null;
  categoryName?: string | null;
  translations: Translation[];
  createdAt: string;
}

export type ActivityType =
  | "LOGIN"
  | "LOGOUT"
  | "TRANSLATION"
  | "SEARCH"
  | "IMAGE_UPLOAD"
  | "IMAGE_RECOGNITION"
  | "SAVE_WORD"
  | "REMOVE_SAVED_WORD"
  | "ADD_VOCABULARY"
  | "EXPORT_PDF"
  | "DOWNLOAD_BOOK"
  | "CHANGE_LANGUAGE"
  | "UPDATE_PROFILE";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  description: string;
  createdAt: string;
}

export interface ActivityStatistics {
  totalActivities: number;
  translations: number;
  imageRecognitions: number;
  pdfExports: number;
  savedWords: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}
