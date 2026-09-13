import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import vm from 'node:vm';

// Exercise the actual TypeScript API module without a browser or backend.
function setup() {
  const calls = [];
  const exports = {};
  const source = readFileSync(fileURLToPath(new URL('../src/features/leaderboard/api.ts', import.meta.url)), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, {
    exports, URLSearchParams,
    require: () => ({ apiClient: { get: (path, options) => { calls.push({ path, options }); return Promise.resolve({}); } } }),
  });
  return { ...exports, calls };
}

test('public categories use documented endpoints, periods, optional bearer handling and cancellation', async () => {
  const { leaderboardApi, calls } = setup();
  const signal = new AbortController().signal;
  for (const [type, endpoint] of [['OVERALL', '/leaderboard'], ['SUBMISSIONS', '/leaderboard/submissions'], ['TRANSLATIONS', '/leaderboard/translations']]) {
    for (const period of ['ALL_TIME', 'MONTHLY', 'WEEKLY']) {
      await leaderboardApi.list(type, period, 20, signal);
      const call = calls.at(-1);
      const url = new URL(call.path, 'https://example.test');
      assert.equal(url.pathname, endpoint);
      assert.equal(url.searchParams.get('period'), period);
      assert.equal(url.searchParams.get('limit'), '20');
      assert.equal(url.searchParams.get('type'), type === 'OVERALL' ? type : null);
      assert.equal(call.options.auth, true); // Shared client attaches a token only if available.
      assert.equal(call.options.signal, signal);
    }
  }
});

test('request limits are bounded and empty admin filters are omitted', async () => {
  const { leaderboardApi, calls } = setup();
  await leaderboardApi.list('OVERALL', 'ALL_TIME', 999);
  assert.equal(new URL(calls.at(-1).path, 'https://example.test').searchParams.get('limit'), '100');
  await leaderboardApi.contributors({ limit: 999, status: '', from: undefined });
  assert.equal(calls.at(-1).path, '/admin/leaderboard?limit=500');
  await leaderboardApi.list('OVERALL', 'WEEKLY', 0);
  assert.equal(new URL(calls.at(-1).path, 'https://example.test').searchParams.get('limit'), '1');
});

test('admin filters and user audit IDs are serialized safely', async () => {
  const { leaderboardApi, calls } = setup();
  await leaderboardApi.contributors({ limit: 50, status: 'PENDING', from: '2026-09-01', to: '2026-09-30' });
  const url = new URL(calls.at(-1).path, 'https://example.test');
  assert.equal(url.pathname, '/admin/leaderboard');
  assert.equal(url.searchParams.get('status'), 'PENDING');
  assert.equal(url.searchParams.get('from'), '2026-09-01');
  assert.equal(url.searchParams.get('to'), '2026-09-30');
  assert.equal(calls.at(-1).options.auth, true);
  await leaderboardApi.audit('user/with?reserved');
  assert.equal(calls.at(-1).path, '/admin/leaderboard/users/user%2Fwith%3Freserved');
  assert.equal(calls.at(-1).options.auth, true);
});

test('only documented admin and moderator roles can open the admin view', () => {
  const { canViewAdminLeaderboard } = setup();
  assert.equal(canViewAdminLeaderboard(), false);
  assert.equal(canViewAdminLeaderboard(['ROLE_USER']), false);
  assert.equal(canViewAdminLeaderboard(['ROLE_LANGUAGE_REVIEWER']), false);
  assert.equal(canViewAdminLeaderboard(['ROLE_ADMIN']), true);
  assert.equal(canViewAdminLeaderboard(['ROLE_USER', 'ROLE_MODERATOR']), true);
});
