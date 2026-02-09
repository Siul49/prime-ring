import { test } from 'node:test';
import assert from 'node:assert';
import { startOfWeek } from './utils.ts';

test('startOfWeek', async (t) => {
    await t.test('Standard cases (Monday start)', () => {
        // Monday 2024-01-01 -> Monday 2024-01-01
        // Using local dates to avoid timezone confusion, though env is UTC
        const date1 = new Date(2024, 0, 1, 12, 0, 0); // Jan 1, 2024 12:00:00 Local
        const expected1 = new Date(2024, 0, 1, 0, 0, 0, 0);
        const result1 = startOfWeek(date1, 1);
        assert.deepStrictEqual(result1, expected1);

        // Tuesday 2024-01-02 -> Monday 2024-01-01
        const date2 = new Date(2024, 0, 2, 12, 0, 0);
        const expected2 = new Date(2024, 0, 1, 0, 0, 0, 0);
        const result2 = startOfWeek(date2, 1);
        assert.deepStrictEqual(result2, expected2);

        // Sunday 2024-01-07 -> Monday 2024-01-01
        const date3 = new Date(2024, 0, 7, 12, 0, 0);
        const expected3 = new Date(2024, 0, 1, 0, 0, 0, 0);
        const result3 = startOfWeek(date3, 1);
        assert.deepStrictEqual(result3, expected3);
    });

    await t.test('Standard cases (Sunday start)', () => {
        // Sunday 2024-01-07 -> Sunday 2024-01-07
        const date1 = new Date(2024, 0, 7, 12, 0, 0);
        const expected1 = new Date(2024, 0, 7, 0, 0, 0, 0);
        const result1 = startOfWeek(date1, 0);
        assert.deepStrictEqual(result1, expected1);

        // Monday 2024-01-08 -> Sunday 2024-01-07
        const date2 = new Date(2024, 0, 8, 12, 0, 0);
        const expected2 = new Date(2024, 0, 7, 0, 0, 0, 0);
        const result2 = startOfWeek(date2, 0);
        assert.deepStrictEqual(result2, expected2);

        // Saturday 2024-01-13 -> Sunday 2024-01-07
        const date3 = new Date(2024, 0, 13, 12, 0, 0);
        const expected3 = new Date(2024, 0, 7, 0, 0, 0, 0);
        const result3 = startOfWeek(date3, 0);
        assert.deepStrictEqual(result3, expected3);
    });

    await t.test('Edge cases', () => {
        // Start of year boundary
        // 2024-01-01 is Monday.
        // If Monday start: 2024-01-01 -> 2024-01-01
        const date1 = new Date(2024, 0, 1, 0, 0, 0);
        const expected1 = new Date(2024, 0, 1, 0, 0, 0, 0);
        assert.deepStrictEqual(startOfWeek(date1, 1), expected1);

        // If Sunday start: 2024-01-01 -> 2023-12-31 (Sunday)
        const date2 = new Date(2024, 0, 1, 0, 0, 0);
        const expected2 = new Date(2023, 11, 31, 0, 0, 0, 0); // Dec 31, 2023
        assert.deepStrictEqual(startOfWeek(date2, 0), expected2);

        // Leap year (2024 is a leap year)
        // Feb 29 2024 is Thursday. Start of week (Monday) is Feb 26.
        const date3 = new Date(2024, 1, 29, 12, 0, 0);
        const expected3 = new Date(2024, 1, 26, 0, 0, 0, 0);
        assert.deepStrictEqual(startOfWeek(date3, 1), expected3);

        // Start of week (Sunday) is Feb 25.
        const expected4 = new Date(2024, 1, 25, 0, 0, 0, 0);
        assert.deepStrictEqual(startOfWeek(date3, 0), expected4);
    });

    await t.test('Time reset', () => {
        const date = new Date(2024, 4, 15, 15, 30, 45, 123);
        const start = startOfWeek(date, 1);
        assert.strictEqual(start.getHours(), 0);
        assert.strictEqual(start.getMinutes(), 0);
        assert.strictEqual(start.getSeconds(), 0);
        assert.strictEqual(start.getMilliseconds(), 0);
    });

    await t.test('Immutability', () => {
        const date = new Date(2024, 4, 15, 10, 0, 0);
        const originalTime = date.getTime();
        startOfWeek(date, 1);
        assert.strictEqual(date.getTime(), originalTime);
    });
});
