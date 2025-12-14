import { useState, useEffect } from 'react'
import { useDiaryStore } from '../../stores/diaryStore'
import { DiaryModal } from './DiaryModal'
import { formatDate } from '../../lib/utils'
import type { Diary } from '../../types'
import './DiaryView.css'

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
        <div className="diary-view">
            <div className="diary-header glass">
                <h2>📝 나의 일기장</h2>
                <button className="btn btn-primary" onClick={handleCreate}>
                    + 일기 쓰기
                </button>
            </div>

            <div className="diary-list">
                {sortedDiaries.length === 0 ? (
                    <div className="empty-state">
                        <p>작성된 일기가 없습니다.</p>
                        <p>오늘의 하루를 기록해보세요!</p>
                    </div>
                ) : (
                    sortedDiaries.map((diary) => (
                        <article key={diary.id} className="diary-card glass" onClick={() => handleEdit(diary)}>
                            <div className="diary-card-header">
                                <div className="diary-date">
                                    <span className="date-day">{formatDate(diary.date, 'dd')}</span>
                                    <div className="date-meta">
                                        <span className="date-month">{formatDate(diary.date, 'yyyy.MM')}</span>
                                        <span className="diary-mood">{getMoodEmoji(diary.mood)}</span>
                                    </div>
                                </div>
                                <div className="diary-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={(e) => handleDelete(diary.id, e)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <h3 className="diary-title">{diary.title}</h3>
                            <p className="diary-preview">{diary.content}</p>
                            {diary.weather && <div className="diary-weather">🌡️ {diary.weather}</div>}
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
