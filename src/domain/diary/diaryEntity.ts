import type { Diary } from './diaryTypes'

export type NewDiaryInput = Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>

export function createDiary(input: NewDiaryInput): Diary {
    const now = new Date()
    return {
        ...input,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
    }
}

export function updateDiary(existing: Diary, data: Partial<Diary>): Diary {
    return {
        ...existing,
        ...data,
        updatedAt: new Date(),
    }
}
