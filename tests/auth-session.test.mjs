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
    process: { env: {} }, require: name => {
      assert.ok(name in imports, `Unexpected import: ${name}`);
      return imports[name];
    }, ...globals,
  });
  return exports;
}
function setup(fetch, initialToken = null) {
  const store = load('../src/lib/auth/token-store.ts');
  store.setAccessToken(initialToken);
  const client = load('../src/lib/api/client.ts', { '@/lib/auth/token-store': store }, { fetch });
  return { ...client, store };
}

test('anonymous bootstrap is shared and never requests a refresh', async () => {
  const calls = [];
  const { restoreAccessToken } = setup(async url => {
    calls.push(url);
    return Response.json({ hasSession: false });
  });
  assert.deepEqual(await Promise.all([restoreAccessToken(), restoreAccessToken()]), [null, null]);
  assert.deepEqual(calls, ['/api/auth/session']);
});

test('cookie session is restored once for concurrent bootstrap calls', async () => {
  const calls = [];
  const { restoreAccessToken, store } = setup(async url => {
    calls.push(url);
    return Response.json(url.endsWith('/session') ? { hasSession: true } : { accessToken: 'fresh' });
  });
  assert.deepEqual(await Promise.all([restoreAccessToken(), restoreAccessToken()]), ['fresh', 'fresh']);
  assert.deepEqual(calls, ['/api/auth/session', '/api/auth/refresh']);
  assert.equal(store.getAccessToken(), 'fresh');
});

test('late unauthorized responses do not refresh a rejected session again', async () => {
  let finishLate;
  let refreshes = 0;
  const { apiClient, store } = setup(async url => {
    if (url === '/api/auth/refresh') {
      refreshes++;
      return Response.json({}, { status: 401 });
    }
    if (url.endsWith('/late')) return new Promise(resolve => { finishLate = resolve; });
    return Response.json({}, { status: 401 });
  }, 'expired');
  const late = apiClient.get('/late', { auth: true });
  const rejected = assert.rejects(late, { status: 401 });
  await assert.rejects(apiClient.get('/first', { auth: true }), { status: 401 });
  finishLate(Response.json({}, { status: 401 }));
  await rejected;
  assert.equal(refreshes, 1);
  assert.equal(store.getAccessToken(), null);
});

test('temporary refresh failure preserves the current session', async () => {
  const { apiClient, store } = setup(async url => Response.json({}, { status: url === '/api/auth/refresh' ? 503 : 401 }), 'existing');
  await assert.rejects(apiClient.get('/profile', { auth: true }), { status: 503 });
  assert.equal(store.getAccessToken(), 'existing');
});

test('logout during bootstrap cannot restore an old token', async () => {
  let finish;
  const { restoreAccessToken, store } = setup(async url => {
    if (url.endsWith('/session')) return Response.json({ hasSession: true });
    return new Promise(resolve => { finish = resolve; });
  });
  const pending = restoreAccessToken();
  while (!finish) await new Promise(resolve => setTimeout(resolve, 0));
  store.setAccessToken(null);
  finish(Response.json({ accessToken: 'stale' }));
  assert.equal(await pending, null);
  assert.equal(store.getAccessToken(), null);
});

function refreshRoute(status, cookie = 'refresh-cookie') {
  const cleared = [];
  const response = { json: (body, init) => Response.json(body, init) };
  let upstreamCalls = 0;
  const route = load('../src/app/api/auth/refresh/route.ts', {
    'next/headers': { cookies: async () => ({ get: () => ({ value: cookie }) }) },
    'next/server': { NextResponse: response },
    '@/lib/api/server-auth': {
      REFRESH_COOKIE: 'refresh', backendBaseUrl: () => 'https://backend.test',
      clearRefreshCookie: res => cleared.push(res), setRefreshCookie: () => {},
    },
  }, { fetch: async () => { upstreamCalls++; return Response.json({}, { status }); } });
  return { ...route, cleared, upstreamCalls: () => upstreamCalls };
}

test('refresh route clears rejected cookies but preserves cookies on backend failures', async () => {
  for (const status of [401, 403, 429, 500, 503]) {
    const route = refreshRoute(status);
    const res = await route.POST();
    assert.equal(res.status, status === 403 ? 401 : status);
    assert.equal(route.cleared.length, status === 401 || status === 403 ? 1 : 0);
    assert.equal(res.headers.get('Cache-Control'), 'private, no-store');
  }
});

test('missing cookie never reaches the backend', async () => {
  const route = refreshRoute(200, '');
  assert.equal((await route.POST()).status, 401);
  assert.equal(route.upstreamCalls(), 0);
});
