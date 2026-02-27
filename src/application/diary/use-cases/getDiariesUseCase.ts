import type { Diary } from '../../../domain/diary/diaryTypes'
import type { DiaryRepository } from '../../../domain/diary/diaryRepository'

export class GetDiariesUseCase {
    constructor(private readonly repository: DiaryRepository) {}

    async execute(): Promise<Diary[]> {
        return this.repository.getAll()
    }
}
