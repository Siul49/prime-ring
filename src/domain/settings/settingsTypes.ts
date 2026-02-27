export type ViewType = 'month' | 'week' | 'day' | 'list' | 'diary'
export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorMode = 'forest' | 'ocean' | 'sunset' | 'berry' | 'midnight'

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
