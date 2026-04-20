import { useState } from 'react'
import { useEventStore } from '../../stores/eventStore'
import { useCategoryStore } from '../../stores/categoryStore'
import { EventModal } from '../calendar/EventModal'
import { isSameDay } from '../../lib/utils'
import './ListView.css'

export function ListView() {
    const { events } = useEventStore()
    const { categories } = useCategoryStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sortedEvents = [...events].sort((a, b) =>
        a.startDate.getTime() - b.startDate.getTime()
    )

    const todayEvents = sortedEvents.filter(e =>
        isSameDay(e.startDate, today)
    )

    const upcomingEvents = sortedEvents.filter(e =>
        e.startDate > today
    )

    const getCategoryColor = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId)
        return category?.color || '#4ADE80'
    }

    const handleAddEvent = () => {
        setSelectedDate(new Date())
        setIsModalOpen(true)
    }

    return (
        <>
            <div className="list-view">
                <div className="list-header glass">
                    <h2>📋 일정 목록</h2>
                    <button className="btn btn-primary" onClick={handleAddEvent}>
                        ➕ 새 일정
                    </button>
                </div>

                <div className="list-content">
                    <section className="list-section glass">
                        <h3 className="section-title">📍 오늘</h3>
                        {todayEvents.length === 0 ? (
                            <p className="empty-message">오늘 일정이 없습니다 ✨</p>
                        ) : (
                            <ul className="event-list">
                                {todayEvents.map(event => (
                                    <li key={event.id} className="event-item">
                                        <div
                                            className="event-color"
                                            style={{ backgroundColor: getCategoryColor(event.categoryId) }}
                                        />
                                        <div className="event-info">
                                            <span className="event-title">{event.title}</span>
                                            {event.description && (
                                                <span className="event-desc">{event.description}</span>
                                            )}
                                        </div>
                                        <span className="event-time">
                                            {event.allDay ? '종일' : event.startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="list-section glass">
                        <h3 className="section-title">📅 예정된 일정</h3>
                        {upcomingEvents.length === 0 ? (
                            <p className="empty-message">예정된 일정이 없습니다 🎉</p>
                        ) : (
                            <ul className="event-list">
                                {upcomingEvents.slice(0, 10).map(event => (
                                    <li key={event.id} className="event-item">
                                        <div
                                            className="event-color"
                                            style={{ backgroundColor: getCategoryColor(event.categoryId) }}
                                        />
                                        <div className="event-info">
                                            <span className="event-title">{event.title}</span>
                                            <span className="event-date">
                                                {event.startDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialDate={selectedDate}
            />
        </>
    )
}
