import { test, describe } from 'node:test'
import assert from 'node:assert'
// @ts-ignore
import { getFirstDayOfMonth } from './dateUtils.ts'

describe('getFirstDayOfMonth', () => {
    test('returns correct day for January 2023 (Sunday)', () => {
        // January is month 0
        const result = getFirstDayOfMonth(2023, 0)
        assert.strictEqual(result, 0, 'January 1, 2023 should be a Sunday (0)')
    })

    test('returns correct day for February 2023 (Wednesday)', () => {
        // February is month 1
        const result = getFirstDayOfMonth(2023, 1)
        assert.strictEqual(result, 3, 'February 1, 2023 should be a Wednesday (3)')
    })

    test('returns correct day for December 2023 (Friday)', () => {
        // December is month 11
        const result = getFirstDayOfMonth(2023, 11)
        assert.strictEqual(result, 5, 'December 1, 2023 should be a Friday (5)')
    })

    test('returns correct day for February 2024 (Leap Year)', () => {
        // February 2024 starts on Thursday
        const result = getFirstDayOfMonth(2024, 1)
        assert.strictEqual(result, 4, 'February 1, 2024 should be a Thursday (4)')
    })

    test('handles month overflow correctly', () => {
         // month 12 corresponds to January of next year
         // January 2024 starts on Monday (1)
         const result = getFirstDayOfMonth(2023, 12)
         assert.strictEqual(result, 1, 'Month 12 (Jan 2024) should be a Monday (1)')
    })

    test('handles negative month correctly', () => {
        // month -1 corresponds to December of previous year
        // December 2022 starts on Thursday (4)
        const result = getFirstDayOfMonth(2023, -1)
        assert.strictEqual(result, 4, 'Month -1 (Dec 2022) should be a Thursday (4)')
   })
})
