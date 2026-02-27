import type { EventRepository } from '../../../domain/calendar/events/eventRepository'
import type { Event } from '../../../domain/calendar/events/eventTypes'
import { JsonFileGateway } from '../../shared/storage/jsonFileGateway'

const EVENTS_FILE_NAME = 'events.json'

function parseEventDates(event: any): Event {
    return {
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
        recurrence: event.recurrence
            ? {
                  ...event.recurrence,
                  endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined,
                  exceptions: event.recurrence.exceptions?.map((date: string) => new Date(date)),
              }
            : undefined,
    }
}

export class EventJsonRepository implements EventRepository {
    constructor(private readonly gateway: JsonFileGateway) {}

    async getAll(): Promise<Event[]> {
        const raw = await this.gateway.load(EVENTS_FILE_NAME)
        if (!raw) {
            return []
        }

        try {
            const parsed = JSON.parse(raw)
            return parsed.map(parseEventDates)
        } catch (error) {
            console.error('Failed to parse events:', error)
            return []
        }
    }

    async saveAll(events: Event[]): Promise<void> {
        await this.gateway.save(EVENTS_FILE_NAME, JSON.stringify(events, null, 2))
    }
}
