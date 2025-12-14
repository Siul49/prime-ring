import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeState {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            setTheme: (theme) => {
                document.documentElement.setAttribute('data-theme', theme)
                set({ theme })
            },
            toggleTheme: () => {
                const newTheme = get().theme === 'dark' ? 'light' : 'dark'
                document.documentElement.setAttribute('data-theme', newTheme)
                set({ theme: newTheme })
            }
        }),
        {
            name: 'primering-theme',
            onRehydrateStorage: () => (state) => {
                // 저장된 테마를 복원할 때 DOM에도 적용
                if (state?.theme) {
                    document.documentElement.setAttribute('data-theme', state.theme)
                }
            }
        }
    )
)
