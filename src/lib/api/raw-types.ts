/**
 * Backend response shapes, verified empirically against the running
 * server (many response bodies are typed as generic `object` in the
 * OpenAPI doc itself, so the schema alone wasn't enough).
 */

export interface RawLanguage {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  region: string;
  active: boolean;
  description?: string | null;
}

export interface RawCategory {
  id: string;
  name: string;
  description?: string | null;
}

export interface RawConcept {
  id: string;
  name: string;
  description?: string | null;
  category: RawCategory;
  referenceImage?: string | null;
}

export interface RawTranslation {
  id: string;
  conceptId: string;
  conceptName: string;
  categoryName: string;
  languageId: string;
  languageName: string;
  text: string;
  pronunciation?: string | null;
  verified: boolean;
  notes?: string | null;
}

export interface RawUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  nativeLanguage?: string | null;
  preferredLanguage?: string | null;
  roles: string[];
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface RawCollectionItem {
  id: string;
  conceptId: string;
  conceptName: string;
  categoryName?: string;
  languageId: string;
  languageName: string;
  translationText: string;
  pronunciation?: string | null;
  notes?: string | null;
  chapter?: string | null;
  displayOrder?: number | null;
  createdAt: string;
}

export interface RawCollection {
  id: string;
  name: string;
  description?: string | null;
  user?: RawUser;
  items?: RawCollectionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RawPdfExport {
  id: string;
  user?: RawUser;
  collection: RawCollection;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export interface RawSubmission {
  id: string;
  concept: RawConcept;
  language: RawLanguage;
  suggestedTranslation: string;
  pronunciation?: string | null;
  notes?: string | null;
  submittedBy?: RawUser;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewerNote?: string | null;
  reviewedBy?: RawUser;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface RawScanResult {
  id: string;
  imageUrl: string;
  detectedLabel: string;
  confidence: number;
  conceptId?: string | null;
  conceptName?: string | null;
  categoryName?: string | null;
  translations: RawTranslation[];
  createdAt: string;
}

export type RawActivityType =
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

export interface RawActivityLog {
  id: string;
  user?: RawUser;
  activityType: RawActivityType;
  description: string;
  referenceId?: string | null;
  metadata?: string | null;
  createdAt: string;
}

export interface RawActivityStatistics {
  totalActivities: number;
  translations: number;
  imageRecognitions: number;
  pdfExports: number;
  savedWords: number;
}
