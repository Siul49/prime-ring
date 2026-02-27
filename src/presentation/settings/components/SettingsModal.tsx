import { useState } from 'react'
import { useModalStore } from '../../calendar/events/stores/modalStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../stores/appStore'
import type { ColorMode } from '../../../types'
import './SettingsModal.css'

const THEME_OPTIONS: { mode: ColorMode; name: string; color: string }[] = [
    { mode: 'forest', name: '포레스트', color: '#22c55e' },
    { mode: 'ocean', name: '오션', color: '#0ea5e9' },
    { mode: 'sunset', name: '선셋', color: '#f97316' },
    { mode: 'berry', name: '베리', color: '#d946ef' },
    { mode: 'midnight', name: '미드나잇', color: '#6366f1' },
]

export function SettingsModal() {
    const { isSettingsOpen, closeSettings } = useModalStore()
    const { categories, addCategory, deleteCategory } = useCategoryStore()
    const { theme, toggleTheme } = useTheme()
    const { colorMode, setColorMode } = useAppStore()
    const [activeTab, setActiveTab] = useState<'general' | 'category'>('general')

    const [newCatName, setNewCatName] = useState('')
    const [newCatColor, setNewCatColor] = useState('#22C55E')
    const [newCatIcon, setNewCatIcon] = useState('🏷️')

    if (!isSettingsOpen) return null

    const handleAddCategory = () => {
        if (!newCatName.trim()) return
        addCategory({
            name: newCatName,
            color: newCatColor,
            icon: newCatIcon,
            userId: 'demo',
        })
        setNewCatName('')
        setNewCatIcon('🏷️')
    }

    return (
        <div className="modal-overlay" onClick={closeSettings}>
            <div className="modal-content glass settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⚙️ 설정</h2>
                    <button className="modal-close" onClick={closeSettings}>✕</button>
                </div>

                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        일반
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'category' ? 'active' : ''}`}
                        onClick={() => setActiveTab('category')}
                    >
                        카테고리 관리
                    </button>
                </div>

                <div className="settings-body">
                    {activeTab === 'general' && (
                        <div className="settings-section">
                            <h3>테마 설정</h3>
                            <div className="setting-item">
                                <span>다크 모드</span>
                                <button className="btn" onClick={toggleTheme}>
                                    {theme === 'dark' ? '🌙 켜짐' : '☀️ 꺼짐'}
                                </button>
                            </div>

                            <h3 style={{ marginTop: '24px' }}>컬러 테마</h3>
                            <div className="theme-grid">
                                {THEME_OPTIONS.map((option) => (
                                    <button
                                        key={option.mode}
                                        className={`theme-card ${colorMode === option.mode ? 'selected' : ''}`}
                                        onClick={() => setColorMode(option.mode)}
                                    >
                                        <div className="theme-preview" style={{ background: option.color }}></div>
                                        <span className="theme-name">{option.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'category' && (
                        <div className="settings-section">
                            <h3>새 카테고리 추가</h3>
                            <div className="add-category-form">
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="이름"
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        className="input cat-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="아이콘"
                                        value={newCatIcon}
                                        onChange={(e) => setNewCatIcon(e.target.value)}
                                        className="input cat-icon-input"
                                        maxLength={2}
                                    />
                                </div>

                                <div className="color-palette">
                                    {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#64748b'].map((color) => (
                                        <button
                                            key={color}
                                            className={`color-swatch ${newCatColor === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setNewCatColor(color)}
                                            aria-label={`Select color ${color}`}
                                        />
                                    ))}
                                </div>

                                <button className="btn btn-primary btn-full" onClick={handleAddCategory}>
                                    카테고리 추가
                                </button>
                            </div>

                            <h3 style={{ marginTop: '20px' }}>카테고리 목록</h3>
                            <ul className="category-list">
                                {categories.map((cat) => (
                                    <li key={cat.id} className="category-list-item">
                                        <div className="cat-info">
                                            <span style={{ color: cat.color }}>{cat.icon}</span>
                                            <span>{cat.name}</span>
                                        </div>
                                        <button
                                            className="btn-delete-cat"
                                            onClick={() => deleteCategory(cat.id)}
                                            style={{ color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                        >
                                            🗑️
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
