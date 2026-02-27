import { updateDiary } from '../../../domain/diary/diaryEntity'
import type { Diary } from '../../../domain/diary/diaryTypes'
import type { DiaryRepository } from '../../../domain/diary/diaryRepository'

export class UpdateDiaryUseCase {
    constructor(private readonly repository: DiaryRepository) {}

    async execute(id: string, data: Partial<Diary>): Promise<void> {
        const diaries = await this.repository.getAll()
        const nextDiaries = diaries.map((diary) => (diary.id === id ? updateDiary(diary, data) : diary))
        await this.repository.saveAll(nextDiaries)
    }
}
