import { updateEvent } from '../../../../domain/calendar/events/eventEntity'
import type { Event } from '../../../../domain/calendar/events/eventTypes'
import type { EventRepository } from '../../../../domain/calendar/events/eventRepository'

export class UpdateEventUseCase {
    constructor(private readonly repository: EventRepository) {}

    async execute(id: string, data: Partial<Event>): Promise<void> {
        const events = await this.repository.getAll()
        const nextEvents = events.map((event) => (event.id === id ? updateEvent(event, data) : event))
        await this.repository.saveAll(nextEvents)
    }
}
