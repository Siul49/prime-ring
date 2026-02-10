import { useState, useEffect } from 'react'
import { useDiaryStore } from '../../stores/diaryStore'
import { DiaryModal } from './DiaryModal'
import { formatDate } from '../../lib/utils'
import type { Diary } from '../../types'

export function DiaryView() {
    const { diaries, loading, deleteDiary, loadDiaries } = useDiaryStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null)

    useEffect(() => {
        loadDiaries()
    }, [loadDiaries])

    const handleCreate = () => {
        setSelectedDiary(null)
        setIsModalOpen(true)
    }

    const handleEdit = (diary: Diary) => {
        setSelectedDiary(diary)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm('이 일기를 삭제하시겠습니까?')) {
            await deleteDiary(id)
        }
    }

    const sortedDiaries = [...diaries].sort((a, b) => b.date.getTime() - a.date.getTime())

    if (loading) return <div className="loading">일기를 불러오는 중...</div>

    return (
        <div className="diary-view !bg-transparent !border-none !shadow-none !p-0">
            <header className="flex items-end justify-between mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-deep-navy font-serif tracking-tight">
                        Journal
                    </h2>
                    <p className="text-serene-blue/60 text-xs font-medium uppercase tracking-widest mt-1">
                        Captured Moments
                    </p>
                </div>
                <button
                    className="px-6 py-2 bg-deep-navy text-white text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-all shadow-lg shadow-deep-navy/10"
                    onClick={handleCreate}
                >
                    Write Entry
                </button>
            </header>

            <div className="diary-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedDiaries.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white/40 ring-1 ring-deep-navy/5 rounded-2xl">
                        <p className="text-serene-blue/40 italic">Your story begins here. Write your first entry.</p>
                    </div>
                ) : (
                    sortedDiaries.map((diary) => (
                        <article
                            key={diary.id}
                            className="group flex flex-col bg-white/60 hover:bg-white transition-all ring-1 ring-deep-navy/5 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:shadow-deep-navy/5"
                            onClick={() => handleEdit(diary)}
                        >
                            <div className="p-8 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl font-bold text-deep-navy font-serif opacity-20 group-hover:opacity-100 transition-opacity">
                                            {formatDate(diary.date, 'dd')}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-serene-blue/60">
                                                {formatDate(diary.date, 'MMM yyyy')}
                                            </span>
                                            <span className="text-lg mt-1">{getMoodEmoji(diary.mood)}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-all"
                                        onClick={(e) => handleDelete(diary.id, e)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-deep-navy mb-3 group-hover:text-primary transition-colors">
                                    {diary.title}
                                </h3>
                                <p className="text-sm text-serene-blue/80 leading-relaxed line-clamp-4 flex-1">
                                    {diary.content}
                                </p>
                                {diary.weather && (
                                    <div className="mt-6 pt-6 border-t border-deep-navy/5 text-[10px] font-bold uppercase tracking-widest text-serene-blue/40">
                                        🌡️ {diary.weather}
                                    </div>
                                )}
                            </div>
                        </article>
                    ))
                )}
            </div>

            {isModalOpen && (
                <DiaryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialDiary={selectedDiary}
                />
            )}
        </div>
    )
}

function getMoodEmoji(mood: string) {
    switch (mood) {
        case 'happy': return '😊'
        case 'sad': return '😢'
        case 'angry': return '😡'
        case 'excited': return '🤩'
        case 'neutral': return '😐'
        default: return '😐'
    }
}
