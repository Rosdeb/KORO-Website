import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

function authHarness(initialPath) {
  let pathname = initialPath;
  let stateIndex = 0;
  let token = null;
  let effects = [];
  const state = [];
  const calls = [];
  const exports = {};
  const imports = {
    react: {
      createContext: () => ({ Provider: 'provider' }),
      useState: initial => {
        const index = stateIndex++;
        if (!(index in state)) state[index] = initial;
        return [state[index], value => { state[index] = value; }];
      },
      useEffect: effect => { effects.push(effect); },
      useCallback: callback => callback,
    },
    'react/jsx-runtime': { jsx: (_type, props) => props },
    'next/navigation': { usePathname: () => pathname, useRouter: () => ({}) },
    '@/lib/api/endpoints': { authApi: {}, profileApi: { me: async () => { calls.push('profile'); return { id: 'user', roles: [] }; } } },
    '@/lib/api/client': { restoreAccessToken: async () => { calls.push('session'); token = 'token'; return token; } },
    '@/lib/api/mappers': { mapUser: user => user },
    '@/lib/auth/token-store': { getAccessToken: () => token, AUTH_LOGOUT_EVENT: 'logout' },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/features/auth/context.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require: name => {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  }, window: { addEventListener() {}, removeEventListener() {} } });
  return {
    calls,
    render(path = pathname) {
      pathname = path;
      stateIndex = 0;
      effects = [];
      const rendered = exports.AuthProvider({ children: null });
      effects.forEach(effect => effect());
      return rendered.value;
    },
  };
}

test('public and auth pages do not automatically restore sessions or fetch profiles', async () => {
  for (const path of ['/', '/about', '/contact', '/languages', '/dictionary', '/leaderboard', '/login', '/register', '/application']) {
    const app = authHarness(path);
    assert.equal(app.render().isLoading, false);
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(app.calls, [], path);
  }
});

test('entering the dashboard restores the session before allowing protected content', async () => {
  const app = authHarness('/about');
  app.render();
  assert.equal(app.render('/app/settings').isLoading, true);
  await new Promise(resolve => setImmediate(resolve));
  const authenticated = app.render();
  assert.equal(authenticated.isLoading, false);
  assert.equal(authenticated.isAuthenticated, true);
  assert.deepEqual(app.calls, ['session', 'profile']);
  app.render('/app/books');
  app.render('/dictionary');
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(app.calls, ['session', 'profile']);
});
