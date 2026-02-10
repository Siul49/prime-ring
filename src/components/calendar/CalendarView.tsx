import { useState } from 'react'
import { formatDate, getDaysInMonth, getFirstDayOfMonth, addMonths, isSameDay } from '../../lib/utils'
import { useEventStore } from '../../stores/eventStore'
import { useModalStore } from '../../stores/modalStore'

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
        <div className="calendar-view !bg-transparent !border-none !shadow-none !p-0">
            <header className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-deep-navy font-serif tracking-tight">
                        {year}. {month + 1}
                    </h2>
                    <p className="text-serene-blue/60 text-xs font-medium uppercase tracking-widest mt-1">
                        Monthly Overview
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex gap-2">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-all ring-1 ring-deep-navy/5"
                            onClick={prevMonth}
                        >
                            <span className="opacity-40 text-xs">◀</span>
                        </button>
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-all ring-1 ring-deep-navy/5"
                            onClick={nextMonth}
                        >
                            <span className="opacity-40 text-xs">▶</span>
                        </button>
                    </div>
                    <button
                        className="text-[11px] font-bold uppercase tracking-wider text-deep-navy/40 hover:text-deep-navy transition-colors"
                        onClick={goToday}
                    >
                        Today
                    </button>
                    <button
                        className="px-6 py-2 bg-deep-navy text-white text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-all shadow-lg shadow-deep-navy/10"
                        onClick={() => {
                            useEventStore.getState().setSelectedEvent(null);
                            openModal(new Date())
                        }}
                    >
                        Add Event
                    </button>
                </div>
            </header>

            <div className="calendar-grid bg-white/40 backdrop-blur-sm ring-1 ring-deep-navy/5 rounded-lg overflow-hidden flex flex-col min-h-0">
                <div className="grid grid-cols-7 border-b border-deep-navy/5">
                    {DAYS_OF_WEEK.map((day, idx) => (
                        <div
                            key={idx}
                            className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-serene-blue/40"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 flex-1 min-h-0">
                    {calendarDays.map((item, idx) => {
                        const dayEvents = item.day ? getEventsForDay(item.day) : []
                        const isToday = item.day && isSameDay(new Date(year, month, item.day), new Date())

                        return (
                            <div
                                key={idx}
                                className={`min-h-[120px] p-2 border-r border-b border-deep-navy/5 flex flex-col relative transition-colors ${!item.isCurrentMonth ? 'bg-neutral-50/30' : 'hover:bg-white/60'} ${isToday ? 'after:absolute after:top-2 after:right-2 after:w-1.5 after:h-1.5 after:bg-deep-navy after:rounded-full' : ''}`}
                                onClick={() => item.day && handleDayClick(item.day)}
                            >
                                {item.day && (
                                    <>
                                        <span className={`text-xs font-bold ${isToday ? 'text-deep-navy' : 'text-serene-blue/40'} mb-2`}>
                                            {item.day}
                                        </span>
                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map((event) => (
                                                <div
                                                    key={event.id}
                                                    className="text-[10px] font-medium text-deep-navy px-2 py-1 bg-white ring-1 ring-deep-navy/5 rounded shadow-sm truncate hover:ring-deep-navy/20 transition-all"
                                                    onClick={(e) => handleEventClick(e, event)}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-[9px] font-bold text-serene-blue/40 px-2">
                                                    + {dayEvents.length - 3} more
                                                </div>
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
    )
}
