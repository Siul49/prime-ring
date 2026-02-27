export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
export type Priority = 'low' | 'medium' | 'high'

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
