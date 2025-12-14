import { useState } from 'react'
import { formatDate, getDaysInMonth, getFirstDayOfMonth, addMonths, isSameDay } from '../../lib/utils'
import { useEventStore } from '../../stores/eventStore'
import { useModalStore } from '../../stores/modalStore'
import './CalendarView.css'

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const { events } = useEventStore()
    const { openModal } = useModalStore()

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const prevMonth = () => setCurrentDate(addMonths(currentDate, -1))
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const goToday = () => setCurrentDate(new Date())

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(year, month, day)
        useEventStore.getState().setSelectedEvent(null) // 날짜 클릭 시 새 일정 모드
        openModal(clickedDate)
    }

    const handleEventClick = (e: React.MouseEvent, event: any) => {
        e.stopPropagation()
        useEventStore.getState().setSelectedEvent(event) // 이벤트 클릭 시 수정 모드
        openModal()
    }

    // Generate calendar grid
    const calendarDays = []
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push({ day: null, isCurrentMonth: false })
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push({ day, isCurrentMonth: true })
    }

    // Get events for a specific day
    const getEventsForDay = (day: number) => {
        const dayDate = new Date(year, month, day)
        return events.filter((event) => {
            const eventDate = event.startDate
            return isSameDay(eventDate, dayDate)
        })
    }

    return (
        <>
            <div className="calendar-view">
                <div className="calendar-header glass">
                    <div className="calendar-nav">
                        <button className="btn btn-icon calendar-nav-btn" onClick={prevMonth}>
                            ◀
                        </button>
                        <h2 className="calendar-title">
                            {year}년 {month + 1}월
                        </h2>
                        <button className="btn btn-icon calendar-nav-btn" onClick={nextMonth}>
                            ▶
                        </button>
                    </div>
                    <div className="calendar-actions">
                        <button className="btn" onClick={goToday}>오늘</button>
                        <button className="btn btn-primary" onClick={() => {
                            useEventStore.getState().setSelectedEvent(null);
                            openModal(new Date())
                        }}>
                            ➕ 새 일정
                        </button>
                    </div>
                </div>

                <div className="calendar-grid glass">
                    <div className="calendar-weekdays">
                        {DAYS_OF_WEEK.map((day, idx) => (
                            <div key={idx} className="weekday">{day}</div>
                        ))}
                    </div>

                    <div className="calendar-days">
                        {calendarDays.map((item, idx) => {
                            const dayEvents = item.day ? getEventsForDay(item.day) : []
                            const isToday = item.day && formatDate(new Date(year, month, item.day)) === formatDate(new Date())

                            return (
                                <div
                                    key={idx}
                                    className={`day-cell ${!item.isCurrentMonth ? 'day-cell-inactive' : ''} ${isToday ? 'day-cell-today' : ''}`}
                                    onClick={() => item.day && handleDayClick(item.day)}
                                >
                                    {item.day && (
                                        <>
                                            <span className="day-number">{item.day}</span>
                                            <div className="day-events">
                                                {dayEvents.slice(0, 3).map((event) => (
                                                    <div
                                                        key={event.id}
                                                        className="event-badge"
                                                        onClick={(e) => handleEventClick(e, event)}
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <div className="event-more">+{dayEvents.length - 3}</div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}
