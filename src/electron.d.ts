import type { Priority, SyncState, Mood, DiaryTemplate } from './types'

export interface EventRowDTO {
    id: string
    title: string
    description: string | null
    startDate: string
    endDate: string
    allDay: boolean
    categoryId: string | null
    tags: string[]
    color: string | null
    priority: Priority
    recurrenceRrule: string | null
    recurrenceExceptions: string[] | null
    metadata: Record<string, unknown> | null
    googleEventId: string | null
    etag: string | null
    syncState: SyncState
    lastSyncedAt: string | null
    createdAt: string
    updatedAt: string
}

export interface DiaryRowDTO {
    id: string
    date: string
    title: string
    content: string
    mood: Mood
    templateType: DiaryTemplate | null
    createdAt: string
    updatedAt: string
}

export interface CategoryRowDTO {
    id: string
    name: string
    color: string
    icon: string | null
    order: number
}

export type IpcResult<T = void> =
    | (T extends void ? { success: true } : { success: true; data: T })
    | { success: false; error: string }

export type AuthStatusDTO =
    | { connected: false }
    | { connected: true; email: string }

export interface IElectronAPI {
    events: {
        list: () => Promise<IpcResult<EventRowDTO[]>>
        get: (id: string) => Promise<IpcResult<EventRowDTO | null>>
        upsert: (row: EventRowDTO) => Promise<IpcResult>
        patch: (payload: { id: string } & Partial<EventRowDTO>) => Promise<IpcResult<EventRowDTO>>
        delete: (id: string) => Promise<IpcResult>
    }
    diaries: {
        list: () => Promise<IpcResult<DiaryRowDTO[]>>
        upsert: (row: DiaryRowDTO) => Promise<IpcResult>
        delete: (id: string) => Promise<IpcResult>
    }
    categories: {
        list: () => Promise<IpcResult<CategoryRowDTO[]>>
        upsert: (row: CategoryRowDTO) => Promise<IpcResult>
        delete: (id: string) => Promise<IpcResult>
    }
    auth: {
        status: () => Promise<IpcResult<AuthStatusDTO>>
        login: () => Promise<IpcResult<AuthStatusDTO>>
        logout: () => Promise<IpcResult>
    }
}

declare global {
    interface Window {
        electron: IElectronAPI
    }
}
