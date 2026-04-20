import type { Category } from '../types'

export const CategoryService = {
    getCategories: async (): Promise<Category[]> => {
        if (!window.electron) return []
        const res = await window.electron.categories.list()
        if (!res.success) throw new Error(res.error)
        return res.data.map((r) => ({
            id: r.id,
            name: r.name,
            color: r.color,
            icon: r.icon ?? undefined,
            order: r.order,
        }))
    },

    upsertCategory: async (cat: Category): Promise<void> => {
        if (!window.electron) return
        const res = await window.electron.categories.upsert({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            icon: cat.icon ?? null,
            order: cat.order,
        })
        if (!res.success) throw new Error(res.error)
    },

    deleteCategory: async (id: string): Promise<void> => {
        if (!window.electron) return
        const res = await window.electron.categories.delete(id)
        if (!res.success) throw new Error(res.error)
    },
}
