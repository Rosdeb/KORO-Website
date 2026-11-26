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

test('translation search within quota returns response and captures rate-limit headers', async () => {
  const { apiClient, getLatestSearchRateLimit } = client(async () => {
    return new Response(JSON.stringify([{ id: 't1', conceptId: 'c1', text: 'water' }]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit-Daily': '50',
        'X-RateLimit-Remaining-Daily': '49',
        'X-RateLimit-Limit-Monthly': '500',
        'X-RateLimit-Remaining-Monthly': '499',
      },
    });
  });
  const results = await apiClient.post('/translations/search', { query: 'water' });
  assert.equal(Array.isArray(results), true);
  assert.equal(results.length, 1);
  assert.equal(results[0].text, 'water');

  const quota = getLatestSearchRateLimit();
  assert.equal(quota?.dailyLimit, 50);
  assert.equal(quota?.dailyRemaining, 49);
  assert.equal(quota?.monthlyLimit, 500);
  assert.equal(quota?.monthlyRemaining, 499);
});

test('translation search exceeding quota (429) throws ApiError with message and headers', async () => {
  const { apiClient, ApiError } = client(async () => {
    return new Response(JSON.stringify({
      message: 'Daily search limit of 50 reached. Please try again tomorrow.',
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit-Daily': '50',
        'X-RateLimit-Remaining-Daily': '0',
        'X-RateLimit-Limit-Monthly': '500',
        'X-RateLimit-Remaining-Monthly': '450',
      },
    });
  });

  await assert.rejects(
    apiClient.post('/translations/search', { query: 'water' }),
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 429);
      assert.equal(err.message, 'Daily search limit of 50 reached. Please try again tomorrow.');
      assert.equal(err.rateLimit?.dailyRemaining, 0);
      assert.equal(err.rateLimit?.dailyLimit, 50);
      return true;
    }
  );
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

test('getApiBaseUrl resolves localhost:8080 when running locally and https://api.korot.site on server', () => {
  const { getApiBaseUrl: getLocalUrl } = client(() => {}, {
    process: { env: { NODE_ENV: 'development' } },
  });
  assert.equal(getLocalUrl(), 'http://localhost:8080');

  const { getApiBaseUrl: getLocalBrowserUrl } = client(() => {}, {
    process: { env: { NODE_ENV: 'production' } },
    window: { location: { hostname: 'localhost' } },
  });
  assert.equal(getLocalBrowserUrl(), 'http://localhost:8080');

  const { getApiBaseUrl: getProdUrl } = client(() => {}, {
    process: { env: { NODE_ENV: 'production' } },
    window: { location: { hostname: 'korot.site' } },
  });
  assert.equal(getProdUrl(), 'https://api.korot.site');

  const { getApiBaseUrl: getExplicitOverride } = client(() => {}, {
    process: { env: { NODE_ENV: 'production', NEXT_PUBLIC_API_BASE_URL: 'https://staging.korot.site' } },
  });
  assert.equal(getExplicitOverride(), 'https://staging.korot.site');
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
