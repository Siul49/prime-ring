import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import { DiaryService } from '../services/diaryService'
import type { Diary } from '../types'

interface DiaryState {
    diaries: Diary[]
    loading: boolean
    selectedDiary: Diary | null

    loadDiaries: () => Promise<void>
    addDiary: (diary: Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
    updateDiary: (id: string, data: Partial<Diary>) => Promise<void>
    deleteDiary: (id: string) => Promise<void>
    setSelectedDiary: (diary: Diary | null) => void
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
    diaries: [],
    loading: true,
    selectedDiary: null,

    loadDiaries: async () => {
        set({ loading: true })
        try {
            const diaries = await DiaryService.getDiaries()
            set({ diaries, loading: false })
        } catch (error) {
            console.error('❌ Error loading diaries:', error)
            set({ loading: false })
            toast.error('일기 목록을 불러오지 못했습니다')
        }
    },

    addDiary: async (diaryData) => {
        try {
            const newDiary = await DiaryService.addDiary(diaryData)
            toast.success('일기가 저장되었습니다 📖')
            set((state) => ({ diaries: [...state.diaries, newDiary] }))
        } catch (error) {
            console.error('❌ Error adding diary:', error)
            toast.error('일기 저장 실패')
        }
    },

    updateDiary: async (id, data) => {
        try {
            await DiaryService.updateDiary(id, data)
            toast.success('일기가 수정되었습니다 ✍️')
            get().loadDiaries()
        } catch (error) {
            console.error('❌ Error updating diary:', error)
            toast.error('일기 수정 실패')
        }
    },

    deleteDiary: async (id) => {
        try {
            await DiaryService.deleteDiary(id)
            toast.success('일기가 삭제되었습니다 🗑️')
            get().loadDiaries()
        } catch (error) {
            console.error('❌ Error deleting diary:', error)
            toast.error('일기 삭제 실패')
        }
    },

    setSelectedDiary: (diary) => set({ selectedDiary: diary }),
}))
