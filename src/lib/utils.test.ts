import { describe, it, expect } from 'vitest';
import { startOfWeek, endOfWeek } from './utils';

describe('Date Utils', () => {
    describe('startOfWeek', () => {
        it('should return the start of the week for a given date (Monday start default)', () => {
            // 2023-10-04 is a Wednesday
            const date = new Date('2023-10-04T12:00:00');
            const start = startOfWeek(date);
            // Should be Monday 2023-10-02
            expect(start.getFullYear()).toBe(2023);
            expect(start.getMonth()).toBe(9); // 0-indexed
            expect(start.getDate()).toBe(2);
            expect(start.getHours()).toBe(0);
            expect(start.getMinutes()).toBe(0);
            expect(start.getSeconds()).toBe(0);
            expect(start.getMilliseconds()).toBe(0);
        });

        it('should return the start of the week when date is already Monday (Monday start)', () => {
            // 2023-10-02 is a Monday
            const date = new Date('2023-10-02T15:30:00');
            const start = startOfWeek(date);
            expect(start.getDate()).toBe(2);
        });

        it('should return the start of the week when date is Sunday (Monday start)', () => {
            // 2023-10-08 is a Sunday
            const date = new Date('2023-10-08T10:00:00');
            const start = startOfWeek(date);
            // Should be Monday 2023-10-02
            expect(start.getDate()).toBe(2);
        });

        it('should return the start of the week with Sunday start', () => {
            // 2023-10-04 is a Wednesday
            const date = new Date('2023-10-04T12:00:00');
            const start = startOfWeek(date, 0);
            // Should be Sunday 2023-10-01
            expect(start.getDate()).toBe(1);
        });
    });

    describe('endOfWeek', () => {
        it('should return the end of the week for a given date (Monday start default)', () => {
            // 2023-10-04 is a Wednesday
            const date = new Date('2023-10-04T12:00:00');
            const end = endOfWeek(date);
            // Should be Sunday 2023-10-08
            expect(end.getFullYear()).toBe(2023);
            expect(end.getMonth()).toBe(9);
            expect(end.getDate()).toBe(8);
            expect(end.getHours()).toBe(23);
            expect(end.getMinutes()).toBe(59);
            expect(end.getSeconds()).toBe(59);
            expect(end.getMilliseconds()).toBe(999);
        });

        it('should return the end of the week when date is already Sunday (Monday start)', () => {
            // 2023-10-08 is a Sunday
            const date = new Date('2023-10-08T10:00:00');
            const end = endOfWeek(date);
            expect(end.getDate()).toBe(8);
        });

        it('should return the end of the week when date is Monday (Monday start)', () => {
             // 2023-10-02 is a Monday
            const date = new Date('2023-10-02T10:00:00');
            const end = endOfWeek(date);
            // Should be Sunday 2023-10-08
            expect(end.getDate()).toBe(8);
        });

        it('should return the end of the week with Sunday start', () => {
            // 2023-10-04 is a Wednesday
            const date = new Date('2023-10-04T12:00:00');
            const end = endOfWeek(date, 0);
            // Should be Saturday 2023-10-07
            expect(end.getDate()).toBe(7);
        });

        it('should handle month/year boundaries correctly', () => {
            // 2023-12-29 is a Friday
            const date = new Date('2023-12-29T12:00:00');
            const end = endOfWeek(date); // Monday start
            // Should be Sunday 2023-12-31
            expect(end.getFullYear()).toBe(2023);
            expect(end.getMonth()).toBe(11);
            expect(end.getDate()).toBe(31);
        });

        it('should handle year boundaries correctly (next year)', () => {
            // 2023-12-31 is a Sunday.
            // If week starts on Monday, the week is Dec 25 - Dec 31.
            const date = new Date('2023-12-31T23:00:00');
            const end = endOfWeek(date);
            expect(end.getFullYear()).toBe(2023);
            expect(end.getMonth()).toBe(11);
            expect(end.getDate()).toBe(31);

             // If week starts on Sunday, the week is Dec 31 - Jan 6.
            const endSun = endOfWeek(date, 0);
            expect(endSun.getFullYear()).toBe(2024);
            expect(endSun.getMonth()).toBe(0);
            expect(endSun.getDate()).toBe(6);
        });

        it('should handle leap years correctly', () => {
            // Feb 29, 2024 is a Thursday
            const date = new Date('2024-02-29T12:00:00');
            const end = endOfWeek(date); // Monday start
            // Should be Sunday, March 3, 2024
            expect(end.getFullYear()).toBe(2024);
            expect(end.getMonth()).toBe(2); // March
            expect(end.getDate()).toBe(3);
        });
    });
});
