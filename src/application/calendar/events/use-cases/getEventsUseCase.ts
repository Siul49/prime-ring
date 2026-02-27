import type { Event } from '../../../../domain/calendar/events/eventTypes'
import type { EventRepository } from '../../../../domain/calendar/events/eventRepository'

export class GetEventsUseCase {
    constructor(private readonly repository: EventRepository) {}

    async execute(): Promise<Event[]> {
        return this.repository.getAll()
    }
}
