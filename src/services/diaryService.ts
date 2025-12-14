import type { Diary } from '../types'

const FILE_NAME = 'diaries.json'

const parseDiaryDates = (diary: any): Diary => ({
    ...diary,
    date: new Date(diary.date),
    createdAt: new Date(diary.createdAt),
    updatedAt: new Date(diary.updatedAt),
})

export const DiaryService = {
    getDiaries: async (): Promise<Diary[]> => {
        if (!window.electron) return []
        const { success, data, error } = await window.electron.loadData(FILE_NAME)
        if (!success) throw new Error(error)
        if (!data) return []

        try {
            const parsed = JSON.parse(data)
            return parsed.map(parseDiaryDates)
        } catch (e) {
            console.error('Failed to parse diaries:', e)
            return []
        }
    },

    saveDiaries: async (diaries: Diary[]) => {
        if (!window.electron) return
        const { success, error } = await window.electron.saveData(FILE_NAME, JSON.stringify(diaries, null, 2))
        if (!success) throw new Error(error)
    },

    addDiary: async (diaryData: Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>) => {
        const diaries = await DiaryService.getDiaries()
        const now = new Date()
        const newDiary: Diary = {
            ...diaryData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
        }
        await DiaryService.saveDiaries([...diaries, newDiary])
        return newDiary
    },

    updateDiary: async (id: string, data: Partial<Diary>) => {
        const diaries = await DiaryService.getDiaries()
        const newDiaries = diaries.map(diary =>
            diary.id === id
                ? { ...diary, ...data, updatedAt: new Date() }
                : diary
        )
        await DiaryService.saveDiaries(newDiaries)
    },

    deleteDiary: async (id: string) => {
        const diaries = await DiaryService.getDiaries()
        const newDiaries = diaries.filter(diary => diary.id !== id)
        await DiaryService.saveDiaries(newDiaries)
    }
}
