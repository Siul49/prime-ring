import { createDiary, type NewDiaryInput } from '../../../domain/diary/diaryEntity'
import type { Diary } from '../../../domain/diary/diaryTypes'
import type { DiaryRepository } from '../../../domain/diary/diaryRepository'

export class AddDiaryUseCase {
    constructor(private readonly repository: DiaryRepository) {}

    async execute(input: NewDiaryInput): Promise<Diary> {
        const diaries = await this.repository.getAll()
        const newDiary = createDiary(input)
        await this.repository.saveAll([...diaries, newDiary])
        return newDiary
    }
}
