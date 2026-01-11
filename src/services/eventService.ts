import type { Event } from '../types'

const FILE_NAME = 'events.json'

// Date 객체 변환 헬퍼 (JSON에서 불러올 때 문자열을 Date로 변환)
const parseEventDates = (event: any): Event => ({
    ...event,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt),
    recurrence: event.recurrence ? {
        ...event.recurrence,
        endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined,
        exceptions: event.recurrence.exceptions?.map((d: string) => new Date(d))
    } : undefined
})

export const EventService = {
    // 모든 이벤트 가져오기
    getEvents: async (): Promise<Event[]> => {
        // Electron 모드: 파일 시스템 사용
        if (window.electron) {
            const { success, data, error } = await window.electron.loadData(FILE_NAME)
            if (!success) throw new Error(error)
            if (!data) return []

            try {
                const parsed = JSON.parse(data)
                return parsed.map(parseEventDates)
            } catch (e) {
                console.error('Failed to parse events:', e)
                return []
            }
        }

        // 브라우저 모드: localStorage 사용
        const data = localStorage.getItem(FILE_NAME)
        if (!data) return []

        try {
            const parsed = JSON.parse(data)
            return parsed.map(parseEventDates)
        } catch (e) {
            console.error('Failed to parse events from localStorage:', e)
            return []
        }
    },

    // 이벤트 저장 (전체 덮어쓰기 방식)
    saveEvents: async (events: Event[]) => {
        const jsonData = JSON.stringify(events, null, 2)

        // Electron 모드: 파일 시스템 사용
        if (window.electron) {
            const { success, error } = await window.electron.saveData(FILE_NAME, jsonData)
            if (!success) throw new Error(error)
            return
        }

        // 브라우저 모드: localStorage 사용
        localStorage.setItem(FILE_NAME, jsonData)
    },

    addEvent: async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
        const events = await EventService.getEvents()
        const now = new Date()
        const newEvent: Event = {
            ...eventData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
        }
        await EventService.saveEvents([...events, newEvent])
        return newEvent
    },

    updateEvent: async (id: string, data: Partial<Event>) => {
        const events = await EventService.getEvents()
        const newEvents = events.map(event =>
            event.id === id
                ? { ...event, ...data, updatedAt: new Date() }
                : event
        )
        await EventService.saveEvents(newEvents)
    },

    deleteEvent: async (id: string) => {
        const events = await EventService.getEvents()
        const newEvents = events.filter(event => event.id !== id)
        await EventService.saveEvents(newEvents)
    }
}

