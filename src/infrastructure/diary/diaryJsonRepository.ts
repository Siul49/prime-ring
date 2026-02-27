import type { DiaryRepository } from '../../domain/diary/diaryRepository'
import type { Diary } from '../../domain/diary/diaryTypes'
import { JsonFileGateway } from '../shared/storage/jsonFileGateway'

const DIARIES_FILE_NAME = 'diaries.json'

function parseDiaryDates(diary: any): Diary {
    return {
        ...diary,
        date: new Date(diary.date),
        createdAt: new Date(diary.createdAt),
        updatedAt: new Date(diary.updatedAt),
    }
}

export class DiaryJsonRepository implements DiaryRepository {
    constructor(private readonly gateway: JsonFileGateway) {}

    async getAll(): Promise<Diary[]> {
        const raw = await this.gateway.load(DIARIES_FILE_NAME)
        if (!raw) {
            return []
        }

        try {
            const parsed = JSON.parse(raw)
            return parsed.map(parseDiaryDates)
        } catch (error) {
            console.error('Failed to parse diaries:', error)
            return []
        }
    }

    async saveAll(diaries: Diary[]): Promise<void> {
        await this.gateway.save(DIARIES_FILE_NAME, JSON.stringify(diaries, null, 2))
    }
}
