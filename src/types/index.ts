
export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
export type Priority = 'low' | 'medium' | 'high'
export type ViewType = 'month' | 'week' | 'day' | 'list' | 'diary'
export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorMode = 'forest' | 'ocean' | 'sunset' | 'berry' | 'midnight'

export interface Event {
    id: string
    title: string
    description?: string
    startDate: Date // Changed from Timestamp
    endDate: Date // Changed from Timestamp
    allDay: boolean
    recurrence?: {
        rule: RecurrenceRule
        interval: number
        endDate?: Date
        exceptions?: Date[]
    }
    categoryId: string
    tags: string[]
    color?: string
    priority: Priority
    metadata?: {
        reminder?: { type: string; value: number }
        portfolio?: { isHighlight: boolean; summary?: string }
    }
    userId: string
    createdAt: Date
    updatedAt: Date
}

export type Mood = 'happy' | 'neutral' | 'sad' | 'excited' | 'angry'

export interface Diary {
    id: string
    date: Date
    title: string
    content: string
    mood: Mood
    weather?: string
    createdAt: Date
    updatedAt: Date
}

export interface Category {
    id: string
    name: string
    color: string
    icon?: string
    userId: string
    order: number
}

export interface UserPreferences {
    userId: string
    theme: ThemeMode
    colorMode: ColorMode
    defaultView: ViewType
    weekStartsOn: 0 | 1
    timezone: string
}

