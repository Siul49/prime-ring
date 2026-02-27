import type { Diary } from '../../domain/diary/diaryTypes'
import type { DiaryRepository } from '../../domain/diary/diaryRepository'
import { AddDiaryUseCase } from './use-cases/addDiaryUseCase'
import { DeleteDiaryUseCase } from './use-cases/deleteDiaryUseCase'
import { GetDiariesUseCase } from './use-cases/getDiariesUseCase'
import { UpdateDiaryUseCase } from './use-cases/updateDiaryUseCase'

export class DiaryApplicationService {
    private readonly getDiariesUseCase: GetDiariesUseCase
    private readonly addDiaryUseCase: AddDiaryUseCase
    private readonly updateDiaryUseCase: UpdateDiaryUseCase
    private readonly deleteDiaryUseCase: DeleteDiaryUseCase

    constructor(repository: DiaryRepository) {
        this.getDiariesUseCase = new GetDiariesUseCase(repository)
        this.addDiaryUseCase = new AddDiaryUseCase(repository)
        this.updateDiaryUseCase = new UpdateDiaryUseCase(repository)
        this.deleteDiaryUseCase = new DeleteDiaryUseCase(repository)
    }

    getDiaries(): Promise<Diary[]> {
        return this.getDiariesUseCase.execute()
    }

    addDiary(data: Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>): Promise<Diary> {
        return this.addDiaryUseCase.execute(data)
    }

    updateDiary(id: string, data: Partial<Diary>): Promise<void> {
        return this.updateDiaryUseCase.execute(id, data)
    }

    deleteDiary(id: string): Promise<void> {
        return this.deleteDiaryUseCase.execute(id)
    }
}
