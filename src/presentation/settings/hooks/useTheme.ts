import { useThemeStore } from '../stores/themeStore'

export function useTheme() {
    const { theme, toggleTheme, setTheme } = useThemeStore()
    return { theme, toggleTheme, setTheme }
}
