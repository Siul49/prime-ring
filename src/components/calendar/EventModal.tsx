import { useState, type FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'
import { useEventStore } from '../../stores/eventStore'
import { useCategoryStore } from '../../stores/categoryStore'
import { formatDate } from '../../lib/utils'

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
        initialDate || selectedEvent?.startDate.toDate() || new Date()
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
            startDate: Timestamp.fromDate(startDate),
            endDate: Timestamp.fromDate(startDate),
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
        <div className="fixed inset-0 bg-deep-navy/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <header className="px-8 py-6 border-b border-deep-navy/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-deep-navy font-serif">
                        {selectedEvent ? 'Edit Event' : 'New Event'}
                    </h2>
                    <button className="text-serene-blue/40 hover:text-deep-navy transition-colors" onClick={onClose}>✕</button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 ml-1">Title</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-neutral-50 ring-1 ring-deep-navy/5 rounded-lg focus:ring-deep-navy/20 outline-none transition-all text-deep-navy placeholder:text-serene-blue/20"
                            placeholder="What's happening?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 ml-1">Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-neutral-50 ring-1 ring-deep-navy/5 rounded-lg focus:ring-deep-navy/20 outline-none transition-all text-deep-navy text-sm"
                                value={formatDate(startDate)}
                                onChange={(e) => setStartDate(new Date(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 ml-1">Category</label>
                            <div className="relative">
                                <div
                                    className="w-full px-4 py-3 bg-neutral-50 ring-1 ring-deep-navy/5 rounded-lg focus:ring-deep-navy/20 outline-none transition-all text-deep-navy text-sm flex items-center justify-between cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsCategoryOpen(!isCategoryOpen)
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        {selectedCategory?.icon} {selectedCategory?.name}
                                    </span>
                                    <span className="text-[8px] opacity-20">▼</span>
                                </div>

                                {isCategoryOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white ring-1 ring-deep-navy/5 shadow-xl rounded-lg overflow-hidden z-[1100]">
                                        {categories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                className={`px-4 py-3 text-sm cursor-pointer hover:bg-neutral-50 flex items-center gap-2 ${categoryId === cat.id ? 'bg-neutral-50 text-deep-navy font-bold' : 'text-serene-blue'}`}
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
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-1">
                        <input
                            type="checkbox"
                            id="allDay"
                            className="w-4 h-4 rounded border-deep-navy/10 text-deep-navy focus:ring-deep-navy/20"
                            checked={allDay}
                            onChange={(e) => setAllDay(e.target.checked)}
                        />
                        <label htmlFor="allDay" className="text-xs font-medium text-serene-blue/60 cursor-pointer select-none">All Day Event</label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 ml-1">Description</label>
                        <textarea
                            className="w-full px-4 py-3 bg-neutral-50 ring-1 ring-deep-navy/5 rounded-lg focus:ring-deep-navy/20 outline-none transition-all text-deep-navy text-sm placeholder:text-serene-blue/20 resize-none"
                            placeholder="Add details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        {selectedEvent && (
                            <button
                                type="button"
                                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors mr-auto"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="button"
                            className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-serene-blue/40 hover:text-deep-navy transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2 bg-deep-navy text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-all shadow-lg shadow-deep-navy/10"
                        >
                            Save Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
