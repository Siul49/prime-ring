import type { Event } from '../types'
import type { EventRowDTO } from '../electron.d'

function toDto(e: Event): EventRowDTO {
    return {
        id: e.id,
        title: e.title,
        description: e.description ?? null,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        allDay: e.allDay,
        categoryId: e.categoryId ?? null,
        tags: e.tags ?? [],
        color: e.color ?? null,
        priority: e.priority,
        recurrenceRrule: e.recurrenceRrule ?? null,
        recurrenceExceptions: e.recurrence?.exceptions
            ? e.recurrence.exceptions.map((d) => d.toISOString())
            : null,
        metadata: e.metadata ?? null,
        googleEventId: e.googleEventId ?? null,
        etag: e.etag ?? null,
        syncState: e.syncState ?? 'local',
        lastSyncedAt: e.lastSyncedAt ? e.lastSyncedAt.toISOString() : null,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
    }
}

function fromDto(r: EventRowDTO): Event {
    return {
        id: r.id,
        title: r.title,
        description: r.description ?? undefined,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        allDay: r.allDay,
        categoryId: r.categoryId ?? '',
        tags: r.tags,
        color: r.color ?? undefined,
        priority: r.priority,
        recurrenceRrule: r.recurrenceRrule ?? undefined,
        recurrence: r.recurrenceExceptions
            ? {
                  rule: 'custom',
                  interval: 1,
                  exceptions: r.recurrenceExceptions.map((s) => new Date(s)),
              }
            : undefined,
        metadata: (r.metadata as Event['metadata']) ?? undefined,
        googleEventId: r.googleEventId ?? undefined,
        etag: r.etag ?? undefined,
        syncState: r.syncState,
        lastSyncedAt: r.lastSyncedAt ? new Date(r.lastSyncedAt) : undefined,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
    }
}

function ensureElectron() {
    if (!window.electron) throw new Error('Electron API not available (run via `npm run dev`)')
}

export const EventService = {
    getEvents: async (): Promise<Event[]> => {
        if (!window.electron) {
            console.warn('Electron API not found. Running in browser mode with empty data.')
            return []
        }
        const res = await window.electron.events.list()
        if (!res.success) throw new Error(res.error)
        return res.data.map(fromDto)
    },

    addEvent: async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'syncState'>) => {
        ensureElectron()
        const now = new Date()
        const newEvent: Event = {
            ...eventData,
            id: crypto.randomUUID(),
            syncState: 'local',
            createdAt: now,
            updatedAt: now,
        }
        const res = await window.electron.events.upsert(toDto(newEvent))
        if (!res.success) throw new Error(res.error)
        return newEvent
    },

    updateEvent: async (id: string, data: Partial<Event>) => {
        ensureElectron()
        // Build a partial DTO with only the fields the caller wants to change.
        // Main process performs read-modify-write atomically inside a transaction.
        const patch: { id: string } & Partial<EventRowDTO> = { id }
        if (data.title !== undefined) patch.title = data.title
        if (data.description !== undefined) patch.description = data.description ?? null
        if (data.startDate !== undefined) patch.startDate = data.startDate.toISOString()
        if (data.endDate !== undefined) patch.endDate = data.endDate.toISOString()
        if (data.allDay !== undefined) patch.allDay = data.allDay
        if (data.categoryId !== undefined) patch.categoryId = data.categoryId
        if (data.tags !== undefined) patch.tags = data.tags
        if (data.color !== undefined) patch.color = data.color ?? null
        if (data.priority !== undefined) patch.priority = data.priority
        if (data.recurrenceRrule !== undefined) patch.recurrenceRrule = data.recurrenceRrule ?? null
        if (data.recurrence?.exceptions !== undefined) {
            patch.recurrenceExceptions = data.recurrence.exceptions.map((d) => d.toISOString())
        }
        if (data.metadata !== undefined) patch.metadata = data.metadata ?? null
        if (data.googleEventId !== undefined) patch.googleEventId = data.googleEventId ?? null
        if (data.etag !== undefined) patch.etag = data.etag ?? null
        if (data.syncState !== undefined) patch.syncState = data.syncState
        if (data.lastSyncedAt !== undefined) patch.lastSyncedAt = data.lastSyncedAt?.toISOString() ?? null
        const res = await window.electron.events.patch(patch)
        if (!res.success) throw new Error(res.error)
    },

    deleteEvent: async (id: string) => {
        ensureElectron()
        const res = await window.electron.events.delete(id)
        if (!res.success) throw new Error(res.error)
    },
}
