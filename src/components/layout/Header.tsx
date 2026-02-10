import { useTheme } from '../../hooks/useTheme'
import { useModalStore } from '../../stores/modalStore'

export function Header() {
    const { theme, toggleTheme } = useTheme()
    const { openSettings } = useModalStore()

    return (
        <div className="flex gap-4 items-center">
            <button
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                onClick={toggleTheme}
                title="테마 변경"
            >
                {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                onClick={openSettings}
                title="설정"
            >
                ⚙️
            </button>
        </div>
    )
}


