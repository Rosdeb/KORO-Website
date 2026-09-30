import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

function load(path, imports = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText,
    {
      exports,
      Request,
      Response,
      Headers,
      process: { env: {} },
      require: (name) => {
        assert.ok(name in imports, `Unexpected import: ${name}`);
        return imports[name];
      },
      ...globals,
    }
  );
  return exports;
}

function mockRoute(filePath, upstreamHandler) {
  const response = { json: (body, init) => Response.json(body, init) };
  return load(
    filePath,
    {
      'next/server': { NextResponse: response },
      '@/lib/api/server-auth': {
        backendBaseUrl: () => 'https://backend.test',
      },
    },
    { fetch: upstreamHandler }
  );
}

test('register route proxies payload and returns 202 Accepted', async () => {
  let capturedUrl;
  let capturedBody;
  const route = mockRoute('../src/app/api/auth/register/route.ts', async (url, opts) => {
    capturedUrl = url;
    capturedBody = JSON.parse(opts.body);
    return Response.json({ message: 'Challenge created' }, { status: 202 });
  });

  const req = new Request('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test User',
      email: 'person@example.com',
      password: 'password123',
      nativeLanguage: 'bn',
      preferredLanguage: 'en',
    }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 202);
  assert.equal(capturedUrl, 'https://backend.test/api/v1/auth/register');
  assert.deepEqual(capturedBody, {
    name: 'Test User',
    email: 'person@example.com',
    password: 'password123',
    nativeLanguage: 'bn',
    preferredLanguage: 'en',
  });
  const data = await res.json();
  assert.equal(data.message, 'Challenge created');
});

test('verify-email route proxies email and 6-digit OTP string', async () => {
  let capturedUrl;
  let capturedBody;
  const route = mockRoute('../src/app/api/auth/verify-email/route.ts', async (url, opts) => {
    capturedUrl = url;
    capturedBody = JSON.parse(opts.body);
    return Response.json({ message: 'Email verified' }, { status: 200 });
  });

  const req = new Request('http://localhost/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({
      email: 'person@example.com',
      otp: '012345',
    }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 200);
  assert.equal(capturedUrl, 'https://backend.test/api/v1/auth/verify-email');
  assert.deepEqual(capturedBody, {
    email: 'person@example.com',
    otp: '012345',
  });
  const data = await res.json();
  assert.equal(data.message, 'Email verified');
});

test('verify-email route forwards 400 when OTP is invalid or expired', async () => {
  const route = mockRoute('../src/app/api/auth/verify-email/route.ts', async () => {
    return Response.json({ message: 'Invalid or expired OTP' }, { status: 400 });
  });

  const req = new Request('http://localhost/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({
      email: 'person@example.com',
      otp: '999999',
    }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.message, 'Invalid or expired OTP');
});

test('resend-verification route forwards email and handles cooldown 429', async () => {
  let capturedBody;
  const route = mockRoute('../src/app/api/auth/resend-verification/route.ts', async (_url, opts) => {
    capturedBody = JSON.parse(opts.body);
    return Response.json({ message: 'Rate limit exceeded. Please wait.' }, { status: 429 });
  });

  const req = new Request('http://localhost/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email: 'person@example.com' }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 429);
  assert.deepEqual(capturedBody, { email: 'person@example.com' });
  const data = await res.json();
  assert.equal(data.message, 'Rate limit exceeded. Please wait.');
});

test('forgot-password route proxies email payload', async () => {
  let capturedUrl;
  let capturedBody;
  const route = mockRoute('../src/app/api/auth/forgot-password/route.ts', async (url, opts) => {
    capturedUrl = url;
    capturedBody = JSON.parse(opts.body);
    return Response.json({ message: 'Accepted' }, { status: 200 });
  });

  const req = new Request('http://localhost/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: 'person@example.com' }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 200);
  assert.equal(capturedUrl, 'https://backend.test/api/v1/auth/forgot-password');
  assert.deepEqual(capturedBody, { email: 'person@example.com' });
});

test('reset-password route passes email, otp string, and newPassword', async () => {
  let capturedUrl;
  let capturedBody;
  const route = mockRoute('../src/app/api/auth/reset-password/route.ts', async (url, opts) => {
    capturedUrl = url;
    capturedBody = JSON.parse(opts.body);
    return Response.json({ message: 'Password reset' }, { status: 200 });
  });

  const req = new Request('http://localhost/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: 'person@example.com',
      otp: '001234',
      newPassword: 'new-secret-password-123',
    }),
  });

  const res = await route.POST(req);
  assert.equal(res.status, 200);
  assert.equal(capturedUrl, 'https://backend.test/api/v1/auth/reset-password');
  assert.deepEqual(capturedBody, {
    email: 'person@example.com',
    otp: '001234',
    newPassword: 'new-secret-password-123',
  });
});
