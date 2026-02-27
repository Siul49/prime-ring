import { create } from 'zustand'
import type { Category } from '../../../types'

// 기본 카테고리 (로컬 상태로 시작, 나중에 Firestore 연동)
const DEFAULT_CATEGORIES: Category[] = [
    { id: 'work', name: '업무', color: '#22C55E', icon: '💼', userId: 'demo', order: 0 },
    { id: 'personal', name: '개인', color: '#3B82F6', icon: '👤', userId: 'demo', order: 1 },
    { id: 'meeting', name: '미팅', color: '#F59E0B', icon: '🤝', userId: 'demo', order: 2 },
    { id: 'study', name: '학습', color: '#8B5CF6', icon: '📚', userId: 'demo', order: 3 },
]

interface CategoryState {
    categories: Category[]
    addCategory: (category: Omit<Category, 'id' | 'order'>) => void
    updateCategory: (id: string, data: Partial<Category>) => void
    deleteCategory: (id: string) => void
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: DEFAULT_CATEGORIES,

    addCategory: (categoryData) => {
        const newCategory: Category = {
            ...categoryData,
            id: `cat-${Date.now()}`,
            order: get().categories.length,
        }
        set({ categories: [...get().categories, newCategory] })
    },

    updateCategory: (id, data) => {
        set({
            categories: get().categories.map((cat) =>
                cat.id === id ? { ...cat, ...data } : cat
            ),
        })
    },

    deleteCategory: (id) => {
        set({
            categories: get().categories.filter((cat) => cat.id !== id),
        })
    },
}))
