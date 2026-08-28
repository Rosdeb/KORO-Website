# My Books ("Collections") — backend changes needed

Context: **My Books** lets a signed-in user collect dictionary words into a personal
book, organise them into chapters, and export the book as a PDF "for publishing".

The website work in this branch added the missing **"Add words" flow** (search the
dictionary from inside a book and add entries into a chapter), plus **edit book**,
**delete book**, and chapter-ordered display — all built on endpoints that already
exist (`POST /collections/{id}/items`, `PUT /collections/{id}`, `DELETE /collections/{id}`).

Add / remove / edit are now **optimistic** on the client (the UI updates instantly and
the add response is patched straight into the cache, so there's no follow-up detail
refetch). That hides latency but does not remove the need for the API changes below —
optimistic UI still has to reconcile against a correct server contract.

What follows is everything the **frontend cannot fix on its own**. Nothing here is
required for the new Add-words flow to work; each item is a real limitation of the
current collection / export API.

Verified against controller source in the `KORO` backend repo:
`src/main/java/com/koro/app/collection/…` and `src/main/java/com/koro/app/export/…`.

---

## 1. `GET /api/v1/collections` returns bare entities — no items, no counts  ⭐ priority

`CollectionController.getMyCollections()` returns `List<Collection>` (the raw entity),
which has only `id, name, description, createdAt, updatedAt`. It does **not** run
through `CollectionResponse` and carries no `items` and no count.

Effect on the website: the **My Books grid cannot show how many words are in each
book.** It currently falls back to a neutral "Open book →" label. Word counts are
only correct on the book detail page, which calls `GET /collections/{id}`.

**Asked for:** make the list endpoint return, per collection, at least an
`itemCount` (cheap: `itemRepository.countByCollectionId(id)`), ideally also
`chapterCount` and `updatedAt`. A dedicated `CollectionSummaryResponse` is fine —
the full `items` array is not needed on the list.

```jsonc
// GET /api/v1/collections  — desired
[
  { "id": "…", "name": "Travel words", "description": "…",
    "itemCount": 42, "chapterCount": 4,
    "createdAt": "…", "updatedAt": "…" }
]
```

---

## 2. No way to edit a collection item after it is created  ⭐ priority

`CollectionController` has `POST /{id}/items` and `DELETE /{id}/items/{itemId}` —
nothing in between. `CollectionItem` stores `notes`, `chapter`, and `displayOrder`,
but once an item exists **none of those can be changed** without deleting and
re-adding it (which also loses `createdAt` and forces the user to re-pick the
language).

This blocks the three things a user needs to actually *shape* a book:

- **move a word to another chapter** (organising an existing book)
- **rename a chapter** (would have to edit every item in it)
- **reorder words** for the printed page (`displayOrder` is otherwise write-once-at-add)
- **edit a per-word note**

**Asked for:** `PATCH /api/v1/collections/{id}/items/{itemId}` (owner-only), partial
update of `chapter`, `notes`, `displayOrder`, and optionally `languageId`:

```jsonc
// PATCH /api/v1/collections/{id}/items/{itemId}
{ "chapter": "Chapter 2 — Food", "displayOrder": 5, "notes": "formal register" }
// → 200 with the updated CollectionItemResponse
```

Nice-to-have alongside it:

- `PUT /api/v1/collections/{id}/chapters` — bulk rename / reorder chapters in one
  call (`[{ "from": "General", "to": "Introduction", "order": 0 }, …]`), so a
  rename isn't N item PATCHes.
- `POST /api/v1/collections/{id}/items/bulk` — add many concepts at once (the new
  Add-words dialog currently fires one request per word).

---

## 3. Duplicate-add responds `400` with a generic message

`POST /{id}/items` returns `400 { "message": "Error: Vocabulary already saved in
this collection." }` when the `(collection, concept, language)` unique index would
be violated. The website now swallows this and shows the word as "Added", but a
`409 Conflict` (or a machine-readable `code`) would let the client distinguish
"already there" from a real validation failure instead of pattern-matching on the
message string.

---

## 4. PDF export — several correctness problems for a "publishable" book  ⭐ priority

`PdfExportService.exportCollectionToPdf(user, collectionId, languageId)`:

### 4a. Non-Latin scripts do not render at all
Every font is `FontFactory.getFont(FontFactory.HELVETICA…)` — a standard PDF Type1
font with **no Unicode support**. Bangla, Chakma, and every other indigenous script
in Koro will export as blank boxes or dropped glyphs. For a multilingual dictionary
this is the headline bug.

**Asked for:** embed a Unicode TTF (e.g. Noto Sans + Noto Sans Bengali / Noto Sans
Chakma) with `BaseFont.IDENTITY_H` and `embedded = true`, and pick the face per
script (or use a font stack). Without this the export feature does not work for its
main use case.

### 4b. Chapters come out in random order
`items.stream().collect(Collectors.groupingBy(CollectionItem::getChapter))` returns
a `HashMap`, so chapter sections are emitted in hash order, not the order the author
intends. Use a `LinkedHashMap` (sorted by a chapter order, see §2) or sort the
entry set explicitly.

### 4c. Words within a chapter ignore `displayOrder`
`for (CollectionItem item : chapterItems)` iterates in `findByCollectionId` order
(insertion). Sort by `displayOrder` then concept name so the author's arrangement
is respected.

### 4d. Single target language only
The request takes one `languageId`; the PDF has one "Translation:" line per entry.
A dictionary book usually wants **the headword plus 2–3 languages side by side**
(e.g. Chakma · Bangla · English).

**Asked for:** accept `languageIds: string[]` (keep `languageId` working as a
one-element alias) and render one column / labelled line per language. Entries with
no translation in a given language should still render the row.

### 4e. Headword is always the English concept name
`item.getConcept().getName()` is the English name. Offer a `headwordLanguageId`
(default: first requested language, or English) so a Chakma learner's book leads
with the Chakma word.

### 4f. `exampleSentence` is never included
`Translation` carries `exampleSentence` (added in the search/submission change) but
the PDF only prints text, pronunciation, and the item note. Add it under each entry.

### Suggested request shape

```jsonc
// POST /api/v1/export/pdf
{
  "collectionId": "…",
  "languageIds": ["<chakma>", "<bn>", "<en>"],   // was: languageId
  "headwordLanguageId": "<chakma>",              // optional
  "includeExampleSentences": true                 // optional, default true
}
```

---

## 5. No "publish" — books are private, owner-only, with no public surface

Every collection endpoint checks `col.getUser().getId().equals(user.getId())` and
returns `403` otherwise. The generated PDF is served from
`GET /api/v1/export/files/{filename}` with `Content-Disposition: attachment` and no
auth check on the file route, but there is **no concept of a published book**:

- no `visibility` / `published` flag on `Collection`
- no public endpoint to list or read someone else's book
- no moderation/review step (unlike dictionary submissions)
- nothing ties a `PdfExport` to a public catalogue

If "for publishing" means *the book (or its PDF) should be discoverable on the
public website*, that is a new feature, roughly:

1. `Collection.visibility = PRIVATE | UNLISTED | PUBLIC` (default `PRIVATE`).
2. `POST /api/v1/collections/{id}/publish` / `…/unpublish` (owner). Optionally
   route `PUBLIC` through the same reviewer/moderator queue submissions use.
3. Public, `permitAll`: `GET /api/v1/public/books` (list published),
   `GET /api/v1/public/books/{id}` (read, with items), and a stable link to the
   latest exported PDF.
4. A `publishedAt`, author display name, and language list for catalogue cards.

Please confirm which meaning of "publish" is intended before this is scoped.

---

## 6. Smaller items

- **`CollectionItemResponse.categoryName`** is populated but the website's
  `GET /collections/{id}` grouping doesn't need it yet — fine, just noting it's there.
- **`chapter` defaults to `"General"`** server-side when omitted; the website sends
  `"General"` explicitly. If §2's chapter ordering lands, agree on whether the
  default bucket is `"General"` or `""`.
- **`displayOrder` defaults to `0`** for every item, so a freshly built book has no
  meaningful order until §2 exists. Consider defaulting it to "append to end of
  chapter" (`max(displayOrder in chapter) + 1`) on add.
- **`GET /collections/{id}` item order** — currently `findByCollectionId` (insertion
  order). Once `displayOrder` is editable, return items already sorted by
  `(chapter, displayOrder)` so every client renders the same order.

---

## Priority summary

| # | Change | Why it matters | Size |
|---|---|---|---|
| 1 | `itemCount` on `GET /collections` | book grid shows "Open book →" instead of counts | XS |
| 2 | `PATCH /collections/{id}/items/{itemId}` | can't reorganise / reorder / re-note a book at all | S |
| 4a | Unicode font in PDF | indigenous scripts don't render — export is unusable for them | S–M |
| 4b–4c | chapter + item ordering in PDF | printed book is in random order | XS |
| 4d | multi-language PDF | dictionary books need parallel columns | M |
| 5 | publish / public books | only if "publishing" means public discovery | L |
| 3 | `409` for duplicate item | client pattern-matches an error string today | XS |
