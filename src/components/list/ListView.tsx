import { useState } from 'react'
import { useEventStore } from '../../stores/eventStore'
import { useCategoryStore } from '../../stores/categoryStore'
import { EventModal } from '../calendar/EventModal'
import { isSameDay } from '../../lib/utils'

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
            <div className="list-view !bg-transparent !border-none !shadow-none !p-0">
                <header className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-deep-navy font-serif tracking-tight">
                            Agenda
                        </h2>
                        <p className="text-serene-blue/60 text-xs font-medium uppercase tracking-widest mt-1">
                            Upcoming Tasks & Events
                        </p>
                    </div>
                    <button
                        className="px-6 py-2 bg-deep-navy text-white text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-all shadow-lg shadow-deep-navy/10"
                        onClick={handleAddEvent}
                    >
                        New Event
                    </button>
                </header>

                <div className="list-content space-y-12">
                    <section className="list-section">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-serene-blue/40 mb-6 flex items-center gap-4">
                            Today
                            <div className="flex-1 h-px bg-deep-navy/5" />
                        </h3>
                        {todayEvents.length === 0 ? (
                            <p className="text-sm text-serene-blue/40 italic py-4">No events scheduled for today.</p>
                        ) : (
                            <ul className="event-list space-y-3">
                                {todayEvents.map(event => (
                                    <li key={event.id} className="group flex items-center gap-6 p-4 bg-white/40 hover:bg-white transition-all ring-1 ring-deep-navy/5 rounded-lg">
                                        <div
                                            className="w-1 h-8 rounded-full"
                                            style={{ backgroundColor: getCategoryColor(event.categoryId) }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-deep-navy truncate">
                                                {event.title}
                                            </h4>
                                            {event.description && (
                                                <p className="text-xs text-serene-blue/60 truncate mt-0.5">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-[10px] font-bold text-serene-blue/40 uppercase tracking-widest whitespace-nowrap">
                                            {event.allDay ? 'All Day' : event.startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="list-section">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-serene-blue/40 mb-6 flex items-center gap-4">
                            Upcoming
                            <div className="flex-1 h-px bg-deep-navy/5" />
                        </h3>
                        {upcomingEvents.length === 0 ? (
                            <p className="text-sm text-serene-blue/40 italic py-4">Nothing on the horizon.</p>
                        ) : (
                            <ul className="event-list space-y-3">
                                {upcomingEvents.slice(0, 10).map(event => (
                                    <li key={event.id} className="group flex items-center gap-6 p-4 bg-white/40 hover:bg-white transition-all ring-1 ring-deep-navy/5 rounded-lg">
                                        <div
                                            className="w-1 h-8 rounded-full opacity-40 group-hover:opacity-100 transition-opacity"
                                            style={{ backgroundColor: getCategoryColor(event.categoryId) }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-deep-navy truncate">
                                                {event.title}
                                            </h4>
                                            <p className="text-xs text-serene-blue/40 font-medium mt-0.5">
                                                {event.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                                            </p>
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
