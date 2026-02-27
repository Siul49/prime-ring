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
