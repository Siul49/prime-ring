import { useTheme } from '../../../settings/hooks/useTheme'
import { useModalStore } from '../../../calendar/events/stores/modalStore'
import './Header.css'

export function Header() {
    const { theme, toggleTheme } = useTheme()
    const { openSettings } = useModalStore()

    return (
        <div className="header-controls">
            <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="테마 변경">
                {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button className="btn btn-ghost btn-icon" onClick={openSettings} title="설정">
                ⚙️
            </button>
        </div>
    )
}

