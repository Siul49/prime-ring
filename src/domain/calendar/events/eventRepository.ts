import type { Event } from './eventTypes'

export interface EventRepository {
    getAll(): Promise<Event[]>
    saveAll(events: Event[]): Promise<void>
}
