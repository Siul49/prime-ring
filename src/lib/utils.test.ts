import { describe, it, expect } from 'vitest'
import { addMonths } from './utils'

describe('addMonths', () => {
    it('should add months correctly within the same year', () => {
        const date = new Date(2023, 0, 15) // Jan 15 2023
        const result = addMonths(date, 2)
        expect(result.getFullYear()).toBe(2023)
        expect(result.getMonth()).toBe(2) // March (0-indexed)
        expect(result.getDate()).toBe(15)
    })

    it('should handle year rollover correctly (Dec -> Jan)', () => {
        const date = new Date(2023, 11, 15) // Dec 15 2023
        const result = addMonths(date, 1)
        expect(result.getFullYear()).toBe(2024)
        expect(result.getMonth()).toBe(0) // Jan
        expect(result.getDate()).toBe(15)
    })

    it('should handle multiple years rollover', () => {
        const date = new Date(2023, 0, 15) // Jan 15 2023
        const result = addMonths(date, 25) // +2 years and 1 month
        expect(result.getFullYear()).toBe(2025)
        expect(result.getMonth()).toBe(1) // Feb
        expect(result.getDate()).toBe(15)
    })

    it('should handle negative months correctly (subtraction)', () => {
        const date = new Date(2023, 2, 15) // Mar 15 2023
        const result = addMonths(date, -1)
        expect(result.getFullYear()).toBe(2023)
        expect(result.getMonth()).toBe(1) // Feb
        expect(result.getDate()).toBe(15)
    })

    it('should handle negative year rollover (Jan -> Dec)', () => {
        const date = new Date(2024, 0, 15) // Jan 15 2024
        const result = addMonths(date, -1)
        expect(result.getFullYear()).toBe(2023)
        expect(result.getMonth()).toBe(11) // Dec
        expect(result.getDate()).toBe(15)
    })

    it('should handle leap years correctly', () => {
        // 2024 is a leap year
        const date = new Date(2024, 0, 31) // Jan 31 2024
        const result = addMonths(date, 1)
        // Standard Date behavior: Jan 31 + 1 month -> Feb 31? No.
        // Feb 2024 has 29 days.
        // Feb 30 -> Mar 1
        // Feb 31 -> Mar 2
        // So expected is Mar 2 2024
        expect(result.getFullYear()).toBe(2024)
        expect(result.getMonth()).toBe(2) // Mar
        expect(result.getDate()).toBe(2)
    })

    it('should handle non-leap years correctly (end of month overflow)', () => {
        const date = new Date(2023, 0, 31) // Jan 31 2023
        const result = addMonths(date, 1)
        // Feb 2023 has 28 days.
        // Feb 29 -> Mar 1
        // Feb 30 -> Mar 2
        // Feb 31 -> Mar 3
        expect(result.getFullYear()).toBe(2023)
        expect(result.getMonth()).toBe(2) // Mar
        expect(result.getDate()).toBe(3)
    })

    it('should not mutate the original date', () => {
        const date = new Date(2023, 0, 15)
        const originalTime = date.getTime()
        addMonths(date, 1)
        expect(date.getTime()).toBe(originalTime)
    })
})
