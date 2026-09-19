import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

function load(path, imports = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, {
    exports, Headers, AbortController, AbortSignal, setTimeout, clearTimeout,
    process: { env: {} },
    require: (name) => {
      assert.ok(name in imports, `Unexpected import: ${name}`);
      return imports[name];
    },
    ...globals,
  });
  return exports;
}

function client(fetch, globals = {}) {
  return load('../src/lib/api/client.ts', {
    '@/lib/auth/token-store': { getAccessToken: () => null },
  }, { fetch, ...globals });
}

test('bodyless reads omit JSON Content-Type; writes retain JSON encoding', async () => {
  const calls = [];
  const { apiClient } = client(async (url, options) => {
    calls.push({ url, ...options });
    return Response.json({ ok: true });
  });
  await apiClient.get('/languages');
  await apiClient.post('/translations/search', { query: 'word' });
  assert.equal(calls[0].headers.has('Content-Type'), false);
  assert.equal(calls[1].headers.get('Content-Type'), 'application/json');
  assert.equal(calls[1].body, '{"query":"word"}');
});

test('cancelled searches abort fetch without becoming timeout errors', async () => {
  const { apiClient } = client((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }));
  const controller = new AbortController();
  const pending = apiClient.post('/translations/search', { query: 'old word' }, { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});

test('stalled reads time out with a useful error and clean up their timer', async () => {
  let timeout;
  let cleared = false;
  const { apiClient, ApiError } = client((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }), {
    setTimeout: (callback, delay) => { assert.equal(delay, 30_000); timeout = callback; return 1; },
    clearTimeout: () => { cleared = true; },
  });
  const pending = apiClient.get('/activity');
  timeout();
  await assert.rejects(pending, (error) => error instanceof ApiError && error.status === 408);
  assert.equal(cleared, true);
});

test('queries retry transient failures once and never retry permanent errors or cancellation', () => {
  const { shouldRetryQuery, ApiError } = client(() => {});
  for (const status of [400, 401, 403, 404, 409, 422, 429]) {
    assert.equal(shouldRetryQuery(0, new ApiError('error', status)), false);
  }
  for (const error of [new ApiError('timeout', 408), new ApiError('unavailable', 503), new TypeError('offline')]) {
    assert.equal(shouldRetryQuery(0, error), true);
    assert.equal(shouldRetryQuery(1, error), false);
  }
  assert.equal(shouldRetryQuery(0, new DOMException('cancelled', 'AbortError')), false);
});

function dictionary(endpoints, qc) {
  return load('../src/features/dictionary/hooks.ts', {
    '@tanstack/react-query': { useQuery: (options) => options, useQueryClient: () => qc },
    '@/lib/api/endpoints': endpoints,
    '@/lib/api/mappers': {
      mapCategory: (raw) => raw,
      mapConceptPage: (raw) => raw,
      mapConcept: (raw) => raw,
      mapTranslation: (raw) => raw,
      toLanguageMap: () => new Map(),
    },
    '@/features/languages/hooks': { fetchLanguages: () => [] },
    '@/lib/utils/slugify': { slugify: (value) => value },
  });
}

test('homepage fetches only six concepts without waiting on language metadata', async () => {
  const signal = new AbortController().signal;
  const hooks = dictionary({ conceptsApi: { list: async (params, receivedSignal) => {
    assert.equal(params.size, 6);
    assert.equal(receivedSignal, signal);
    return { content: Array.from({ length: 6 }, (_, id) => ({ id })) };
  } } }, { ensureQueryData: () => assert.fail('List should not fetch languages') });
  assert.equal((await hooks.usePopularConcepts().queryFn({ signal })).length, 6);
});

test('concept, translations, and language requests start together and forward cancellation', async () => {
  const started = [];
  const releases = [];
  const signal = new AbortController().signal;
  const pending = (name, value) => { started.push(name); return new Promise((resolve) => releases.push(() => resolve(value))); };
  const hooks = dictionary({
    conceptsApi: { getById: (id, receivedSignal) => {
      assert.equal(receivedSignal, signal);
      return pending('concept', { id });
    } },
    translationsApi: { list: ({ conceptId }, receivedSignal) => {
      assert.equal(conceptId, 'word-1');
      assert.equal(receivedSignal, signal);
      return pending('translations', [{ text: 'word' }]);
    } },
  }, { ensureQueryData: () => pending('languages', []) });
  const result = hooks.useConcept('word-1').queryFn({ signal });
  assert.deepEqual(started, ['languages', 'concept', 'translations']);
  releases.forEach((resolve) => resolve());
  assert.equal((await result).translations[0].text, 'word');
});
