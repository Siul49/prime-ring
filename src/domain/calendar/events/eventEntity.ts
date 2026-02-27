import type { Event } from './eventTypes'

export type NewEventInput = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>

export function createEvent(input: NewEventInput): Event {
    const now = new Date()
    return {
        ...input,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
    }
}

export function updateEvent(existing: Event, data: Partial<Event>): Event {
    return {
        ...existing,
        ...data,
        updatedAt: new Date(),
    }
}
