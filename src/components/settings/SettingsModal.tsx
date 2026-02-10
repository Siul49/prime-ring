import { useState } from 'react'
import { useModalStore } from '../../stores/modalStore'
import { useCategoryStore } from '../../stores/categoryStore'
import { useTheme } from '../../hooks/useTheme'
import { useAppStore } from '../../stores/appStore'
import type { ColorMode } from '../../types'

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
        <div className="fixed inset-0 bg-deep-navy/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4" onClick={closeSettings}>
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <header className="px-8 py-6 border-b border-deep-navy/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-deep-navy font-serif">Settings</h2>
                    <button className="text-serene-blue/40 hover:text-deep-navy transition-colors" onClick={closeSettings}>✕</button>
                </header>

                <nav className="flex px-8 border-b border-deep-navy/5">
                    <button
                        className={`py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'general' ? 'text-deep-navy' : 'text-serene-blue/40 hover:text-serene-blue'}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                        {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-deep-navy" />}
                    </button>
                    <button
                        className={`ml-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'category' ? 'text-deep-navy' : 'text-serene-blue/40 hover:text-serene-blue'}`}
                        onClick={() => setActiveTab('category')}
                    >
                        Categories
                        {activeTab === 'category' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-deep-navy" />}
                    </button>
                </nav>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {activeTab === 'general' && (
                        <div className="space-y-10">
                            <section>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 mb-6">Appearance</h3>
                                <div className="flex items-center justify-between p-4 bg-neutral-50 ring-1 ring-deep-navy/5 rounded-xl">
                                    <span className="text-sm font-medium text-deep-navy">Dark Mode</span>
                                    <button
                                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-deep-navy text-white' : 'bg-white text-serene-blue ring-1 ring-deep-navy/10'}`}
                                        onClick={toggleTheme}
                                    >
                                        {theme === 'dark' ? 'On' : 'Off'}
                                    </button>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 mb-6">Color Accent</h3>
                                <div className="grid grid-cols-5 gap-3">
                                    {THEME_OPTIONS.map((option) => (
                                        <button
                                            key={option.mode}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${colorMode === option.mode ? 'bg-neutral-50 ring-1 ring-deep-navy/10' : 'hover:bg-neutral-50/50'}`}
                                            onClick={() => setColorMode(option.mode)}
                                        >
                                            <div className="w-6 h-6 rounded-full shadow-inner" style={{ background: option.color }}></div>
                                            <span className="text-[9px] font-bold text-serene-blue/60 uppercase">{option.mode}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'category' && (
                        <div className="space-y-10">
                            <section>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 mb-6">Add New Category</h3>
                                <div className="p-6 bg-neutral-50 ring-1 ring-deep-navy/5 rounded-xl space-y-4">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Category Name"
                                            value={newCatName}
                                            onChange={(e) => setNewCatName(e.target.value)}
                                            className="flex-1 px-4 py-2 bg-white ring-1 ring-deep-navy/5 rounded-lg text-sm outline-none focus:ring-deep-navy/10"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Icon"
                                            value={newCatIcon}
                                            onChange={(e) => setNewCatIcon(e.target.value)}
                                            className="w-16 px-2 py-2 bg-white ring-1 ring-deep-navy/5 rounded-lg text-center text-sm outline-none"
                                            maxLength={2}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#64748b'].map((color) => (
                                            <button
                                                key={color}
                                                className={`w-6 h-6 rounded-full ring-2 ring-offset-2 transition-all ${newCatColor === color ? 'ring-deep-navy scale-110' : 'ring-transparent'}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setNewCatColor(color)}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        className="w-full py-2 bg-deep-navy text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-all"
                                        onClick={handleAddCategory}
                                    >
                                        Add Category
                                    </button>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 mb-6">Existing Categories</h3>
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between p-4 bg-white ring-1 ring-deep-navy/5 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg" style={{ color: cat.color }}>{cat.icon}</span>
                                                <span className="text-sm font-medium text-deep-navy">{cat.name}</span>
                                            </div>
                                            <button
                                                className="p-2 text-serene-blue/20 hover:text-red-400 transition-colors"
                                                onClick={() => deleteCategory(cat.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
