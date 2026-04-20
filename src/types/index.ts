export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
export type Priority = 'low' | 'medium' | 'high'
export type ViewType = 'month' | 'week' | 'day' | 'list' | 'diary'
export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorMode = 'forest' | 'ocean' | 'sunset' | 'berry' | 'midnight'
export type SyncState = 'local' | 'synced' | 'dirty' | 'deleted'

export interface Event {
    id: string
    title: string
    description?: string
    startDate: Date
    endDate: Date
    allDay: boolean
    recurrence?: {
        rule: RecurrenceRule
        interval: number
        endDate?: Date
        exceptions?: Date[]
    }
    // Google Calendar compatible iCal RRULE string (Phase 2 uses this directly)
    recurrenceRrule?: string
    categoryId: string
    tags: string[]
    color?: string
    priority: Priority
    metadata?: {
        reminder?: { type: string; value: number }
        portfolio?: { isHighlight: boolean; summary?: string }
    }
    // Phase 2 sync fields (present in schema v1, populated in Phase 2)
    googleEventId?: string
    etag?: string
    syncState: SyncState
    lastSyncedAt?: Date
    createdAt: Date
    updatedAt: Date
}

export type Mood = 'happy' | 'neutral' | 'sad' | 'excited' | 'angry'
export type DiaryTemplate = 'morning' | 'weekly_retro' | 'free'

export interface Diary {
    id: string
    date: Date
    title: string
    content: string
    mood: Mood
    weather?: string
    templateType?: DiaryTemplate
    createdAt: Date
    updatedAt: Date
}

export interface Category {
    id: string
    name: string
    color: string
    icon?: string
    order: number
}

export interface UserPreferences {
    theme: ThemeMode
    colorMode: ColorMode
    defaultView: ViewType
    weekStartsOn: 0 | 1
    timezone: string
}
