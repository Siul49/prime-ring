import type { EventRepository } from '../../../../domain/calendar/events/eventRepository'

export class DeleteEventUseCase {
    constructor(private readonly repository: EventRepository) {}

    async execute(id: string): Promise<void> {
        const events = await this.repository.getAll()
        await this.repository.saveAll(events.filter((event) => event.id !== id))
    }
}
