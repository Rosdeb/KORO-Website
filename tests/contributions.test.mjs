import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

// Transpile and load chart-utils
const chartUtilsExports = {};
const chartUtilsSource = readFileSync(new URL('../src/features/activity/chart-utils.ts', import.meta.url), 'utf8');
vm.runInNewContext(ts.transpileModule(chartUtilsSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: chartUtilsExports, require: () => ({}) });

const { toDhakaDateString, extractDayCounts, DHAKA_TIMEZONE } = chartUtilsExports;

test('contributions data normalization and Dhaka timezone handling', () => {
  // A dictionary submission created at 2026-11-20 22:00:00 UTC -> 2026-11-21 04:00:00 in Dhaka
  const submissionTimestamp = '2026-11-20T22:00:00.000Z';
  const dhakaDate = toDhakaDateString(submissionTimestamp);
  assert.equal(dhakaDate, '2026-11-21');

  const entries = [
    { createdAt: '2026-11-20T22:00:00.000Z' }, // counted for 2026-11-21 in Dhaka
    { createdAt: '2026-11-21T06:00:00.000Z' }, // counted for 2026-11-21 in Dhaka
    { createdAt: '2026-11-21T19:00:00.000Z' }, // counted for 2026-11-22 in Dhaka
  ];

  const counts = extractDayCounts(entries, DHAKA_TIMEZONE);
  assert.equal(counts['2026-11-21'], 2);
  assert.equal(counts['2026-11-22'], 1);
});
