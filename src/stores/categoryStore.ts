import { create } from 'zustand'
import type { Category } from '../types'
import { CategoryService } from '../services/categoryService'

const DEFAULT_CATEGORIES: Category[] = [
    { id: 'work', name: '업무', color: '#22C55E', icon: '💼', order: 0 },
    { id: 'personal', name: '개인', color: '#3B82F6', icon: '👤', order: 1 },
    { id: 'meeting', name: '미팅', color: '#F59E0B', icon: '🤝', order: 2 },
    { id: 'study', name: '학습', color: '#8B5CF6', icon: '📚', order: 3 },
]

interface CategoryState {
    categories: Category[]
    loaded: boolean
    loadCategories: () => Promise<void>
    addCategory: (category: Omit<Category, 'id' | 'order'>) => Promise<void>
    updateCategory: (id: string, data: Partial<Category>) => Promise<void>
    deleteCategory: (id: string) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: DEFAULT_CATEGORIES,
    loaded: false,

    loadCategories: async () => {
        try {
            const stored = await CategoryService.getCategories()
            if (stored.length === 0) {
                // Seed defaults on first run
                for (const c of DEFAULT_CATEGORIES) {
                    await CategoryService.upsertCategory(c)
                }
                set({ categories: DEFAULT_CATEGORIES, loaded: true })
            } else {
                set({ categories: stored, loaded: true })
            }
        } catch (err) {
            console.error('❌ Error loading categories:', err)
            set({ loaded: true })
        }
    },

    addCategory: async (categoryData) => {
        const newCategory: Category = {
            ...categoryData,
            id: `cat-${Date.now()}`,
            order: get().categories.length,
        }
        await CategoryService.upsertCategory(newCategory)
        set({ categories: [...get().categories, newCategory] })
    },

    updateCategory: async (id, data) => {
        const next = get().categories.map((cat) => (cat.id === id ? { ...cat, ...data } : cat))
        const updated = next.find((c) => c.id === id)
        if (updated) await CategoryService.upsertCategory(updated)
        set({ categories: next })
    },

    deleteCategory: async (id) => {
        await CategoryService.deleteCategory(id)
        set({ categories: get().categories.filter((cat) => cat.id !== id) })
    },
}))
