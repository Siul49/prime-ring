import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { formatDate } from './date-utils.ts'

// Note: Using node:test because external testing dependencies (like Vitest) are unavailable in this environment.
// Testing date-utils.ts directly avoids dependency on clsx which is broken in node_modules.

describe('formatDate', () => {
    it('should format date with default format (yyyy-MM-dd)', () => {
        const date = new Date(2023, 9, 5) // October 5, 2023
        strictEqual(formatDate(date), '2023-10-05')
    })

    it('should format date with custom format', () => {
        const date = new Date(2023, 9, 5)
        strictEqual(formatDate(date, 'dd/MM/yyyy'), '05/10/2023')
        strictEqual(formatDate(date, 'MM.dd.yyyy'), '10.05.2023')
        strictEqual(formatDate(date, 'yyyy/MM/dd'), '2023/10/05')
    })

    it('should pad single digit month and day', () => {
        const date = new Date(2023, 0, 1) // January 1, 2023
        strictEqual(formatDate(date, 'yyyy-MM-dd'), '2023-01-01')
    })

    it('should handle double digit month and day correctly', () => {
        const date = new Date(2023, 11, 31) // December 31, 2023
        strictEqual(formatDate(date, 'yyyy-MM-dd'), '2023-12-31')
    })
})
