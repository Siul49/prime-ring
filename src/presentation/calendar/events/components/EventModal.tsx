import { useState, type FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { useEventStore } from '../stores/eventStore'
import { useCategoryStore } from '../../../settings/stores/categoryStore'
import { formatDate } from '../../../../lib/utils'
import './EventModal.css'

interface EventModalProps {
    isOpen: boolean
    onClose: () => void
    initialDate?: Date
}

export function EventModal({ isOpen, onClose, initialDate }: EventModalProps) {
    const { addEvent, selectedEvent, updateEvent } = useEventStore()
    const { categories } = useCategoryStore()
    const [title, setTitle] = useState(selectedEvent?.title || '')
    const [description, setDescription] = useState(selectedEvent?.description || '')
    const [categoryId, setCategoryId] = useState(selectedEvent?.categoryId || 'work')
    const [startDate, setStartDate] = useState(
        initialDate || selectedEvent?.startDate || new Date()
    )
    const [allDay, setAllDay] = useState<boolean>(selectedEvent?.allDay ?? true)

    // Custom Dropdown State
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const selectedCategory = categories.find(c => c.id === categoryId) || categories[0]

    if (!isOpen) return null

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const eventData = {
            title,
            description,
            startDate,
            endDate: startDate,
            allDay,
            categoryId,
            tags: [],
            priority: 'medium' as const,
            userId: 'demo-user',
        }

        if (selectedEvent) {
            await updateEvent(selectedEvent.id, eventData)
        } else {
            await addEvent(eventData)
        }

        setTitle('')
        setDescription('')
        onClose()
    }

    const handleDelete = () => {
        if (!selectedEvent) return

        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '240px', padding: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🗑️</span>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>일정을 삭제하시겠습니까?</p>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    삭제된 일정은 복구할 수 없습니다.
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="btn"
                        style={{
                            padding: '6px 12px',
                            fontSize: '0.9rem',
                            height: 'auto'
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={async () => {
                            await useEventStore.getState().deleteEvent(selectedEvent.id)
                            toast.dismiss(t.id)
                            onClose()
                        }}
                        className="btn"
                        style={{
                            padding: '6px 12px',
                            fontSize: '0.9rem',
                            height: 'auto',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        삭제
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            style: {
                minWidth: '300px',
            }
        })
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{selectedEvent ? '📝 일정 수정' : '✨ 새 일정'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <input
                            type="text"
                            className="input"
                            placeholder="일정 제목을 입력하세요..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">📅 날짜</label>
                        <input
                            type="date"
                            className="input"
                            value={formatDate(startDate)}
                            onChange={(e) => setStartDate(new Date(e.target.value))}
                        />
                    </div>

                    {/* Custom Category Dropdown */}
                    <div className="form-group">
                        <label className="form-label">📁 카테고리</label>
                        <div
                            className="custom-select-trigger"
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsCategoryOpen(!isCategoryOpen)
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {selectedCategory?.icon} {selectedCategory?.name}
                            </span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>▼</span>
                        </div>

                        {isCategoryOpen && (
                            <>
                                <div
                                    className="fixed inset-0"
                                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsCategoryOpen(false)
                                    }}
                                />
                                <div className="custom-select-dropdown" style={{ zIndex: 100 }}>
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className={`custom-select-option ${categoryId === cat.id ? 'selected' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setCategoryId(cat.id)
                                                setIsCategoryOpen(false)
                                            }}
                                        >
                                            {cat.icon} {cat.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-checkbox">
                            <input
                                type="checkbox"
                                checked={allDay}
                                onChange={(e) => setAllDay(e.target.checked)}
                            />
                            <span>하루 종일</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="form-label">📝 설명</label>
                        <textarea
                            className="input form-textarea"
                            placeholder="설명 (선택사항)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions">
                        {selectedEvent && (
                            <button
                                type="button"
                                className="btn"
                                onClick={handleDelete}
                                style={{
                                    marginRight: 'auto',
                                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                🗑️ 삭제
                            </button>
                        )}
                        <button type="button" className="btn" onClick={onClose}>취소</button>
                        <button type="submit" className="btn btn-primary">저장</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
