import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

function createJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.mock-signature`;
}

function loadModule(relativePath, extraImports = {}, extraGlobals = {}) {
  const exports = {};
  const context = {
    exports,
    Request,
    Response,
    Headers,
    AbortSignal,
    atob: (str) => Buffer.from(str, 'base64').toString('utf-8'),
    Buffer,
    process: {
      env: {},
    },
    require: (name) => {
      if (name in extraImports) return extraImports[name];
      throw new Error(`Unexpected import: ${name}`);
    },
    fetch: globalThis.fetch,
    setTimeout,
    clearTimeout,
    console,
    ...extraGlobals,
  };

  const fileUrl = new URL(relativePath, import.meta.url);
  const code = ts.transpileModule(readFileSync(fileUrl, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;

  vm.runInNewContext(code, context);
  return exports;
}

test('TranslationService tries Cloudflare Workers AI as primary and Azure Translator as fallback', async () => {
  const calls = [];

  const mockCloudflareAI = {
    name: 'cloudflare-workers-ai',
    isAvailable: async () => true,
    translate: async (text, from, to) => {
      calls.push('cloudflare-ai');
      return 'Cloudflare Result';
    },
  };

  const mockAzure = {
    name: 'azure-translator',
    isAvailable: async () => true,
    translate: async (text, from, to) => {
      calls.push('azure-translator');
      return 'Azure Result';
    },
  };

  // Load TranslationService class definition
  const { TranslationService } = loadModule(
    '../src/lib/translation/translation-service.ts',
    {
      './types': {},
      './providers/cloudflare-ai': { CloudflareWorkersAIProvider: class {} },
      './providers/azure-translator': { AzureTranslatorProvider: class {} },
      './providers/gemini': { GeminiTranslationProvider: class {} },
      './providers/scraper-fallback': { ScraperFallbackProvider: class {} },
    }
  );

  const service = new TranslationService([mockCloudflareAI, mockAzure]);
  const result = await service.translate('Hello', 'en', 'bn');

  assert.equal(result.translatedText, 'Cloudflare Result');
  assert.equal(result.provider, 'cloudflare-workers-ai');
  assert.deepEqual(calls, ['cloudflare-ai'], 'Should not call Azure when Cloudflare AI succeeds');
});

test('TranslationService falls back to Azure Translator when Cloudflare AI fails', async () => {
  const calls = [];

  const failingCloudflareAI = {
    name: 'cloudflare-workers-ai',
    isAvailable: async () => true,
    translate: async () => {
      calls.push('cloudflare-ai-fail');
      return null; // upstream rate-limited or failed
    },
  };

  const mockAzure = {
    name: 'azure-translator',
    isAvailable: async () => true,
    translate: async (text, from, to) => {
      calls.push('azure-translator-success');
      return 'পানি';
    },
  };

  const { TranslationService } = loadModule(
    '../src/lib/translation/translation-service.ts',
    {
      './types': {},
      './providers/cloudflare-ai': { CloudflareWorkersAIProvider: class {} },
      './providers/azure-translator': { AzureTranslatorProvider: class {} },
      './providers/gemini': { GeminiTranslationProvider: class {} },
      './providers/scraper-fallback': { ScraperFallbackProvider: class {} },
    }
  );

  const service = new TranslationService([failingCloudflareAI, mockAzure]);
  const result = await service.translate('Water', 'en', 'bn');

  assert.equal(result.translatedText, 'পানি');
  assert.equal(result.provider, 'azure-translator');
  assert.deepEqual(calls, ['cloudflare-ai-fail', 'azure-translator-success']);
});

test('GeminiTranslationProvider translates properly and cleans quotation marks and periods', async () => {
  let capturedUrl;
  let capturedBody;

  const { GeminiTranslationProvider } = loadModule(
    '../src/lib/translation/providers/gemini.ts',
    {
      '../types': {},
    },
    {
      process: { env: { GEMINI_API_KEY: 'test-gemini-key' } },
      fetch: async (url, opts) => {
        capturedUrl = url;
        capturedBody = JSON.parse(opts.body);
        return Response.json({
          candidates: [
            {
              content: {
                parts: [{ text: ' "পানি." ' }],
              },
            },
          ],
        });
      },
    }
  );

  const provider = new GeminiTranslationProvider();
  assert.equal(provider.isAvailable(), true);

  const translated = await provider.translate('Water', 'en', 'bn');
  assert.equal(translated, 'পানি');
  assert.match(capturedUrl, /gemini-flash-lite-latest.*key=test-gemini-key/);
  assert.match(capturedBody.contents[0].parts[0].text, /Water/);
});

function loadTranslateRoute(upstreamHandler, translationServiceMock) {
  const response = {
    json: (body, init) => Response.json(body, init),
  };

  const authModule = loadModule(
    '../src/app/api/translate/auth.ts',
    {
      'next/server': { NextResponse: response },
      '@/lib/api/server-auth': {
        backendBaseUrl: () => 'https://backend.test',
      },
    },
    { fetch: upstreamHandler }
  );

  return loadModule(
    '../src/app/api/translate/route.ts',
    {
      'next/server': { NextResponse: response },
      '@/lib/api/server-auth': {
        backendBaseUrl: () => 'https://backend.test',
      },
      '@/lib/translation': {
        defaultTranslationService: translationServiceMock,
      },
      './auth': authModule,
    },
    { fetch: upstreamHandler }
  );
}

test('translate route rejects unauthenticated requests with 401', async () => {
  const route = loadTranslateRoute(async () => Response.json({}), {
    translate: async () => ({ translatedText: 'ok', provider: 'test' }),
  });

  const req = new Request('http://localhost/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Hello', from: 'en', to: 'bn' }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.match(data.error, /authentication/i);
});

test('translate route rejects expired token with 401', async () => {
  const expiredToken = createJwt({ sub: 'user1', exp: Math.floor(Date.now() / 1000) - 3600 });
  const route = loadTranslateRoute(async () => Response.json({ id: 'user1' }), {
    translate: async () => ({ translatedText: 'ok', provider: 'test' }),
  });

  const req = new Request('http://localhost/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${expiredToken}`,
    },
    body: JSON.stringify({ text: 'Hello', from: 'en', to: 'bn' }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 401);
});

test('translate route translates successfully with provider architecture when authenticated', async () => {
  const validToken = createJwt({ sub: 'user1', exp: Math.floor(Date.now() / 1000) + 3600 });
  let serviceCalled = false;

  const mockService = {
    translate: async (text, from, to) => {
      serviceCalled = true;
      assert.equal(text, 'Water');
      assert.equal(from, 'en');
      assert.equal(to, 'bn');
      return { translatedText: 'পানি', provider: 'cloudflare-workers-ai' };
    },
  };

  const route = loadTranslateRoute(
    async (url) => {
      if (url.includes('/api/v1/users/profile')) {
        return Response.json({ id: 'user1', name: 'Test User' }, { status: 200 });
      }
      return Response.json({}, { status: 404 });
    },
    mockService
  );

  const req = new Request('http://localhost/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${validToken}`,
    },
    body: JSON.stringify({ text: 'Water', from: 'en', to: 'bn' }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.translatedText, 'পানি');
  assert.equal(data.provider, 'cloudflare-workers-ai');
  assert.equal(serviceCalled, true);
});

test('translate route rejects oversized input with 400', async () => {
  const validToken = createJwt({ sub: 'user1', exp: Math.floor(Date.now() / 1000) + 3600 });
  const route = loadTranslateRoute(async (url) => {
    if (url.includes('/api/v1/users/profile')) {
      return Response.json({ id: 'user1' }, { status: 200 });
    }
    return Response.json({});
  }, {
    translate: async () => null,
  });

  const req = new Request('http://localhost/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${validToken}`,
    },
    body: JSON.stringify({ text: 'a'.repeat(1001), from: 'en', to: 'bn' }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /maximum allowed length/i);
});

test('translate route returns 502 with error message when all translation providers fail', async () => {
  const validToken = createJwt({ sub: 'user1', exp: Math.floor(Date.now() / 1000) + 3600 });
  const route = loadTranslateRoute(async (url) => {
    if (url.includes('/api/v1/users/profile')) {
      return Response.json({ id: 'user1' }, { status: 200 });
    }
    return Response.json({});
  }, {
    translate: async () => null, // all providers failed
  });

  const req = new Request('http://localhost/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${validToken}`,
    },
    body: JSON.stringify({ text: 'Test word', from: 'en', to: 'bn' }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 502);
  const data = await res.json();
  assert.equal(data.translatedText, '');
  assert.match(data.error, /unavailable/i);
});
