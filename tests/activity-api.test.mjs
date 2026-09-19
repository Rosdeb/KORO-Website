import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const exports = {};
const source = readFileSync(new URL('../src/lib/api/mappers.ts', import.meta.url), 'utf8');
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports, require: () => ({}) });
const mapPage = (raw) => JSON.parse(JSON.stringify(exports.mapActivityPage(raw)));

const entry = {
  id: 'activity-1',
  activityType: 'UPDATE_PROFILE',
  description: 'Updated profile fields',
  createdAt: '2026-09-19T04:23:22.951',
  metadata: null,
  referenceId: null,
  user: { id: 'user-1', name: 'Example User' },
};
const expectedEntry = {
  id: entry.id,
  type: entry.activityType,
  description: entry.description,
  createdAt: entry.createdAt,
};

test('plain activity arrays render as a complete page without nested user data', () => {
  const entries = Array.from({ length: 15 }, (_, i) => ({ ...entry, id: `activity-${i}` }));
  const page = mapPage(entries);
  assert.equal(page.content.length, 15);
  assert.deepEqual(page.content[1], expectedEntry);
  assert.equal(page.totalElements, 15);
  assert.equal(page.size, 15);
  assert.equal(page.page, 0);
  assert.equal(page.totalPages, 1);
  assert.equal(page.hasNext, false);
  assert.equal(page.hasPrevious, false);
});

test('empty activity arrays produce an empty state without pagination', () => {
  assert.deepEqual(mapPage([]), {
    content: [], page: 0, size: 0, totalElements: 0,
    totalPages: 0, hasNext: false, hasPrevious: false,
  });
});

test('paginated responses retain server pagination and map entries', () => {
  const raw = {
    content: [entry], page: 1, size: 10, totalElements: 25,
    totalPages: 3, hasNext: true, hasPrevious: true,
  };
  assert.deepEqual(mapPage(raw), { ...raw, content: [expectedEntry] });
});
