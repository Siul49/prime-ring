import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import { EventService } from '../services/eventService'
import type { Event } from '../types'

interface EventState {
    events: Event[]
    loading: boolean
    selectedEvent: Event | null
    unsubscribe: (() => void) | null

    addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'syncState'>) => Promise<void>
    updateEvent: (id: string, data: Partial<Event>) => Promise<void>
    deleteEvent: (id: string) => Promise<void>
    setSelectedEvent: (event: Event | null) => void
    subscribeToEvents: () => void
    loadEvents: () => Promise<void>
    cleanup: () => void
}

export const useEventStore = create<EventState>((set, get) => ({
    events: [],
    loading: true,
    selectedEvent: null,
    unsubscribe: null,

    addEvent: async (eventData) => {
        try {
            await EventService.addEvent(eventData)
            toast.success('일정이 추가되었습니다 ✨')
            get().loadEvents()
        } catch (error) {
            console.error('❌ Error adding event:', error)
            toast.error('일정 추가에 실패했습니다')
        }
    },

    updateEvent: async (id, data) => {
        try {
            await EventService.updateEvent(id, data)
            toast.success('일정이 수정되었습니다 📝')
            get().loadEvents()
        } catch (error) {
            console.error('❌ Error updating event:', error)
            toast.error('일정 수정에 실패했습니다')
        }
    },

    deleteEvent: async (id) => {
        try {
            await EventService.deleteEvent(id)
            toast.success('일정이 삭제되었습니다 🗑️')
            get().loadEvents()
        } catch (error) {
            console.error('❌ Error deleting event:', error)
            toast.error('일정 삭제에 실패했습니다')
        }
    },

    setSelectedEvent: (event) => set({ selectedEvent: event }),

    subscribeToEvents: () => {
        get().loadEvents()
    },

    loadEvents: async () => {
        set({ loading: true })
        try {
            const events = await EventService.getEvents()
            set({ events, loading: false })
            console.log('📅 Events loaded:', events.length)
        } catch (error) {
            console.error('❌ Error loading events:', error)
            set({ loading: false })
        }
    },

    cleanup: () => {
        // No-op for local storage
    },
}))
