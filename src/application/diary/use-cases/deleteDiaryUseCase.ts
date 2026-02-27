import type { DiaryRepository } from '../../../domain/diary/diaryRepository'

export class DeleteDiaryUseCase {
    constructor(private readonly repository: DiaryRepository) {}

    async execute(id: string): Promise<void> {
        const diaries = await this.repository.getAll()
        await this.repository.saveAll(diaries.filter((diary) => diary.id !== id))
    }
}
