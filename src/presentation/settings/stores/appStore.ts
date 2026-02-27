import { create } from 'zustand'
import type { ThemeMode, ColorMode, ViewType } from '../../../types'

interface AppState {
    theme: ThemeMode
    colorMode: ColorMode
    currentView: ViewType
    setTheme: (theme: ThemeMode) => void
    setColorMode: (mode: ColorMode) => void
    setCurrentView: (view: ViewType) => void
    toggleTheme: () => void
    toggleColorMode: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
    theme: 'light',
    colorMode: 'forest',
    currentView: 'month',

    setTheme: (theme) => {
        set({ theme })
        document.documentElement.setAttribute('data-theme', theme)
    },

    setColorMode: (mode) => {
        set({ colorMode: mode })
        document.documentElement.setAttribute('data-mode', mode)
    },

    setCurrentView: (view) => set({ currentView: view }),

    toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
    },

    toggleColorMode: () => {
        const newMode = get().colorMode === 'forest' ? 'ocean' : 'forest'
        get().setColorMode(newMode)
    },
}))
