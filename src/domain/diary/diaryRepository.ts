import type { Diary } from './diaryTypes'

export interface DiaryRepository {
    getAll(): Promise<Diary[]>
    saveAll(diaries: Diary[]): Promise<void>
}
