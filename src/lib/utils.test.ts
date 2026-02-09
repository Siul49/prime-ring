import { describe, it, expect } from 'vitest'
import { formatTime } from './utils'

describe('formatTime', () => {
    it('formats normal time correctly', () => {
        const date = new Date(2024, 0, 1, 14, 30) // 14:30
        expect(formatTime(date)).toBe('14:30')
    })

    it('pads single digit hours with leading zero', () => {
        const date = new Date(2024, 0, 1, 9, 30) // 09:30
        expect(formatTime(date)).toBe('09:30')
    })

    it('pads single digit minutes with leading zero', () => {
        const date = new Date(2024, 0, 1, 14, 5) // 14:05
        expect(formatTime(date)).toBe('14:05')
    })

    it('formats midnight correctly', () => {
        const date = new Date(2024, 0, 1, 0, 0) // 00:00
        expect(formatTime(date)).toBe('00:00')
    })

    it('formats end of day correctly', () => {
        const date = new Date(2024, 0, 1, 23, 59) // 23:59
        expect(formatTime(date)).toBe('23:59')
    })
})
