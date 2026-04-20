import type { Diary } from '../types'
import type { DiaryRowDTO } from '../electron.d'

function toDateKey(d: Date): string {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function toDto(d: Diary): DiaryRowDTO {
    return {
        id: d.id,
        date: toDateKey(d.date),
        title: d.title,
        content: d.content,
        mood: d.mood,
        templateType: d.templateType ?? null,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
    }
}

function fromDto(r: DiaryRowDTO): Diary {
    return {
        id: r.id,
        date: new Date(r.date + 'T00:00:00'),
        title: r.title,
        content: r.content,
        mood: r.mood,
        templateType: r.templateType ?? undefined,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
    }
}

function ensureElectron() {
    if (!window.electron) throw new Error('Electron API not available (run via `npm run dev`)')
}

export const DiaryService = {
    getDiaries: async (): Promise<Diary[]> => {
        if (!window.electron) return []
        const res = await window.electron.diaries.list()
        if (!res.success) throw new Error(res.error)
        return res.data.map(fromDto)
    },

    addDiary: async (diaryData: Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>) => {
        ensureElectron()
        const now = new Date()
        const newDiary: Diary = {
            ...diaryData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
        }
        const res = await window.electron.diaries.upsert(toDto(newDiary))
        if (!res.success) throw new Error(res.error)
        return newDiary
    },

    updateDiary: async (id: string, data: Partial<Diary>) => {
        ensureElectron()
        const existing = (await DiaryService.getDiaries()).find((d) => d.id === id)
        if (!existing) throw new Error(`Diary ${id} not found`)
        const merged: Diary = { ...existing, ...data, id, updatedAt: new Date() }
        const res = await window.electron.diaries.upsert(toDto(merged))
        if (!res.success) throw new Error(res.error)
    },

    deleteDiary: async (id: string) => {
        ensureElectron()
        const res = await window.electron.diaries.delete(id)
        if (!res.success) throw new Error(res.error)
    },
}
