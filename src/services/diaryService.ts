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
        // Electron 모드: 파일 시스템 사용
        if (window.electron) {
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
        }

        // 브라우저 모드: localStorage 사용
        const data = localStorage.getItem(FILE_NAME)
        if (!data) return []

        try {
            const parsed = JSON.parse(data)
            return parsed.map(parseDiaryDates)
        } catch (e) {
            console.error('Failed to parse diaries from localStorage:', e)
            return []
        }
    },

    saveDiaries: async (diaries: Diary[]) => {
        const jsonData = JSON.stringify(diaries, null, 2)

        // Electron 모드: 파일 시스템 사용
        if (window.electron) {
            const { success, error } = await window.electron.saveData(FILE_NAME, jsonData)
            if (!success) throw new Error(error)
            return
        }

        // 브라우저 모드: localStorage 사용
        localStorage.setItem(FILE_NAME, jsonData)
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
