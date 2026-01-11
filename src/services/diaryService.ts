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

        // 브라우저 모드: localStorage 사용 (보안 강화)
        try {
            // 🔒 보안: 데이터 크기 제한 (5MB, 대부분의 브라우저에서 안전)
            const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB
            const dataSize = new Blob([jsonData]).size

            if (dataSize > MAX_STORAGE_SIZE) {
                const sizeMB = (dataSize / 1024 / 1024).toFixed(2)
                throw new Error(
                    `데이터가 너무 큽니다 (${sizeMB}MB). ` +
                    `오래된 다이어리를 삭제하거나 데스크톱 앱을 사용하세요.`
                )
            }

            // 저장 시도
            localStorage.setItem(FILE_NAME, jsonData)

            // 성공 시 저장 용량 로깅 (개발 모드)
            if (import.meta.env.DEV) {
                const sizeKB = (dataSize / 1024).toFixed(2)
                console.log(`✅ Diaries saved to localStorage: ${sizeKB}KB / ${MAX_STORAGE_SIZE / 1024 / 1024}MB`)
            }
        } catch (error: any) {
            // QuotaExceededError 처리
            if (error.name === 'QuotaExceededError') {
                throw new Error(
                    '저장 공간이 부족합니다. ' +
                    '브라우저 저장소가 가득 찼습니다. ' +
                    '오래된 다이어리를 삭제하거나 Electron 데스크톱 앱을 사용하세요.'
                )
            }

            // 기타 에러
            throw new Error(`다이어리 저장 실패: ${error.message}`)
        }
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
