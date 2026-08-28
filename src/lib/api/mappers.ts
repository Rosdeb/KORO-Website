import { resolveApiFileUrl } from "./client";
import { slugify } from "@/lib/utils/slugify";
import type {
  ActivityEntry,
  Book,
  BookItem,
  Category,
  Concept,
  ExportRecord,
  Language,
  ScanResult,
  Submission,
  Translation,
  User,
} from "@/types";
import type {
  RawActivityLog,
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

/**
 * id -> short language code (e.g. "bn"), built once from the cached
 * languages list. The backend's TranslationResponse and CollectionItem
 * shapes only carry languageId/languageName, not the code the UI needs
 * for script fonts and /languages/{code} routes.
 */
export type LanguageMap = Map<string, string>;

export function toLanguageMap(languages: { id: string; code: string }[]): LanguageMap {
  return new Map(languages.map((l) => [l.id, l.code]));
}

export function mapLanguage(raw: RawLanguage): Language {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    nativeName: raw.nativeName,
    region: raw.region,
    active: raw.active,
    description: raw.description,
  };
}

export function mapCategory(raw: RawCategory): Category {
  return {
    id: raw.id,
    slug: slugify(raw.name),
    name: raw.name,
    description: raw.description,
  };
}

export function mapTranslation(raw: RawTranslation, languages: LanguageMap): Translation {
  return {
    id: raw.id,
    languageId: raw.languageId,
    languageCode: languages.get(raw.languageId) ?? "",
    languageName: raw.languageName,
    text: raw.text,
    pronunciation: raw.pronunciation,
    verified: raw.verified,
    notes: raw.notes,
  };
}

export function mapConcept(raw: RawConcept, translations: RawTranslation[], languages: LanguageMap): Concept {
  return {
    id: raw.id,
    slug: slugify(raw.name),
    name: raw.name,
    description: raw.description,
    categoryId: raw.category.id,
    categoryName: raw.category.name,
    categorySlug: slugify(raw.category.name),
    imageUrl: raw.referenceImage,
    translations: translations.map((t) => mapTranslation(t, languages)),
  };
}

export function mapUser(raw: RawUser): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    avatarUrl: raw.profileImage ?? undefined,
    nativeLanguage: raw.nativeLanguage ?? undefined,
    preferredLanguage: raw.preferredLanguage ?? undefined,
    roles: raw.roles ?? [],
    status: raw.status,
  };
}

export function mapBookItem(raw: RawCollectionItem, languages: LanguageMap): BookItem {
  return {
    id: raw.id,
    conceptId: raw.conceptId,
    conceptName: raw.conceptName,
    languageId: raw.languageId,
    languageCode: languages.get(raw.languageId) ?? "",
    languageName: raw.languageName,
    translationText: raw.translationText,
    pronunciation: raw.pronunciation,
    note: raw.notes,
    chapter: raw.chapter,
    displayOrder: raw.displayOrder,
  };
}

export function mapBook(raw: RawCollection, languages: LanguageMap): Book {
  const items = (raw.items ?? []).map((item) => mapBookItem(item, languages));
  return {
    id: raw.id,
    title: raw.name,
    description: raw.description,
    items,
    // GET /collections (list) returns no items array; only GET /collections/{id}
    // does. Leave wordCount undefined when we can't actually count.
    wordCount: raw.items ? items.length : undefined,
    updatedAt: raw.updatedAt,
  };
}

export function mapExportRecord(raw: RawPdfExport): ExportRecord {
  return {
    id: raw.id,
    bookId: raw.collection.id,
    bookTitle: raw.collection.name,
    fileUrl: resolveApiFileUrl(raw.fileUrl),
    fileName: raw.fileName,
    fileSize: raw.fileSize,
    createdAt: raw.createdAt,
  };
}

export function mapSubmission(raw: RawSubmission): Submission {
  return {
    id: raw.id,
    categoryId: raw.category?.id ?? "",
    categoryName: raw.category?.name ?? "Uncategorized",
    sourceLanguageId: raw.sourceLanguage?.id ?? "",
    sourceLanguageCode: raw.sourceLanguage?.code ?? "",
    sourceLanguageName: raw.sourceLanguage?.name ?? "Unknown language",
    sourceWord: raw.sourceWord ?? "",
    banglaTranslation: raw.banglaTranslation ?? "",
    englishTranslation: raw.englishTranslation ?? "",
    pronunciation: raw.pronunciation,
    exampleSentence: raw.exampleSentence,
    note: raw.notes,
    status: raw.status,
    reviewerNote: raw.reviewerNote,
    rejectionReason: raw.rejectionReason,
    createdAt: raw.createdAt,
    reviewedAt: raw.reviewedAt,
    submittedByName: raw.submittedBy?.name,
    submittedByEmail: raw.submittedBy?.email,
  };
}

export function mapScanResult(raw: RawScanResult, languages: LanguageMap): ScanResult {
  return {
    id: raw.id,
    imageUrl: resolveApiFileUrl(raw.imageUrl),
    detectedLabel: raw.detectedLabel,
    confidence: raw.confidence,
    conceptId: raw.conceptId,
    conceptName: raw.conceptName,
    categoryName: raw.categoryName,
    translations: raw.translations.map((t) => mapTranslation(t, languages)),
    createdAt: raw.createdAt,
  };
}

export function mapActivityEntry(raw: RawActivityLog): ActivityEntry {
  return {
    id: raw.id,
    type: raw.activityType,
    description: raw.description,
    createdAt: raw.createdAt,
  };
}
