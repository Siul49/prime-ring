import { createEvent, type NewEventInput } from '../../../../domain/calendar/events/eventEntity'
import type { Event } from '../../../../domain/calendar/events/eventTypes'
import type { EventRepository } from '../../../../domain/calendar/events/eventRepository'

export class AddEventUseCase {
    constructor(private readonly repository: EventRepository) {}

    async execute(input: NewEventInput): Promise<Event> {
        const events = await this.repository.getAll()
        const newEvent = createEvent(input)
        await this.repository.saveAll([...events, newEvent])
        return newEvent
    }
}
