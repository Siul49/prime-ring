import { type ClassValue, clsx } from 'clsx'

export * from './date-utils.ts'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}
