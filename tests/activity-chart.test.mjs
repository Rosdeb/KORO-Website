import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const exports = {};
const source = readFileSync(new URL('../src/features/activity/chart-utils.ts', import.meta.url), 'utf8');
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports, require: () => ({}) });

const {
  DHAKA_TIMEZONE,
  toDhakaDateString,
  toTimezoneDateString,
  extractDayCounts,
  getColorLevel,
  generateCalendarDays,
  getMonthLabels,
  computeStreakStats,
} = exports;

test('extractDayCounts aggregates activities by YYYY-MM-DD correctly without timeZone', () => {
  const entries = [
    { createdAt: '2026-11-10T10:00:00.000Z' },
    { createdAt: '2026-11-10T14:30:00.000Z' },
    { createdAt: '2026-11-10T23:59:59.000Z' },
    { createdAt: '2026-11-11T08:15:00.000Z' },
    { createdAt: '' },
    {},
  ];
  const counts = extractDayCounts(entries);
  assert.equal(counts['2026-11-10'], 3);
  assert.equal(counts['2026-11-11'], 1);
  assert.equal(counts['2026-11-12'], undefined);
});

test('extractDayCounts with Asia/Dhaka timezone correctly offsets UTC timestamps (+06:00)', () => {
  // 2026-11-10 20:00:00 UTC is 2026-11-11 02:00:00 in Dhaka (UTC+6)
  const entries = [
    { createdAt: '2026-11-10T10:00:00.000Z' }, // 16:00 Nov 10 in Dhaka
    { createdAt: '2026-11-10T20:00:00.000Z' }, // 02:00 Nov 11 in Dhaka
  ];
  const counts = extractDayCounts(entries, DHAKA_TIMEZONE);
  assert.equal(counts['2026-11-10'], 1);
  assert.equal(counts['2026-11-11'], 1);

  assert.equal(toDhakaDateString('2026-11-10T20:00:00.000Z'), '2026-11-11');
});

test('getColorLevel returns appropriate 0-4 thresholds', () => {
  assert.equal(getColorLevel(0, 10), 0);
  assert.equal(getColorLevel(1, 4), 1);
  assert.equal(getColorLevel(2, 4), 2);
  assert.equal(getColorLevel(3, 4), 3);
  assert.equal(getColorLevel(4, 4), 4);
  assert.equal(getColorLevel(10, 4), 4);

  // Scaled with maxCount > 4
  assert.equal(getColorLevel(1, 20), 1);
  assert.equal(getColorLevel(6, 20), 2);
  assert.equal(getColorLevel(12, 20), 3);
  assert.equal(getColorLevel(18, 20), 4);
});

test('generateCalendarDays lays out 53 weeks column-major with valid day of week rows', () => {
  const endDate = new Date(2026, 10, 11); // Nov 11, 2026 (Wednesday, day 3)
  const dayCounts = { '2026-11-11': 5 };
  const days = generateCalendarDays(endDate, dayCounts, 52);

  assert.ok(days.length >= 365);
  const lastDay = days[days.length - 1];
  assert.equal(lastDay.dateStr, '2026-11-11');
  assert.equal(lastDay.row, 3); // Wednesday
  assert.equal(lastDay.col, 52); // Week 52
  assert.equal(lastDay.count, 5);
  assert.equal(lastDay.level, 4);

  // Check first day is a Sunday (row 0) in column 0
  assert.equal(days[0].row, 0);
  assert.equal(days[0].col, 0);
});

test('getMonthLabels identifies distinct month boundaries', () => {
  const endDate = new Date(2026, 10, 11);
  const days = generateCalendarDays(endDate, {}, 52);
  const labels = getMonthLabels(days, 'en');

  assert.ok(labels.length >= 10);
  assert.ok(labels.some((l) => l.name.startsWith('Nov') || l.name === 'Nov'));
  assert.ok(labels.some((l) => l.name.startsWith('Jan') || l.name === 'Jan'));
});

test('computeStreakStats calculates total, active days, max streak, and current streak', () => {
  const endDate = new Date(2026, 10, 11);
  const dayCounts = {
    '2026-11-08': 1,
    '2026-11-09': 2,
    '2026-11-10': 3,
    '2026-11-11': 4,
  };
  const days = generateCalendarDays(endDate, dayCounts, 52);
  const stats = computeStreakStats(dayCounts, days);

  assert.equal(stats.total, 10);
  assert.equal(stats.activeDays, 4);
  assert.equal(stats.maxStreak, 4);
  assert.equal(stats.currentStreak, 4);
});
