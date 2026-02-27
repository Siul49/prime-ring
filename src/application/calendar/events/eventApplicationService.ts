import type { Event } from '../../../domain/calendar/events/eventTypes'
import type { EventRepository } from '../../../domain/calendar/events/eventRepository'
import { AddEventUseCase } from './use-cases/addEventUseCase'
import { DeleteEventUseCase } from './use-cases/deleteEventUseCase'
import { GetEventsUseCase } from './use-cases/getEventsUseCase'
import { UpdateEventUseCase } from './use-cases/updateEventUseCase'

export class EventApplicationService {
    private readonly getEventsUseCase: GetEventsUseCase
    private readonly addEventUseCase: AddEventUseCase
    private readonly updateEventUseCase: UpdateEventUseCase
    private readonly deleteEventUseCase: DeleteEventUseCase

    constructor(repository: EventRepository) {
        this.getEventsUseCase = new GetEventsUseCase(repository)
        this.addEventUseCase = new AddEventUseCase(repository)
        this.updateEventUseCase = new UpdateEventUseCase(repository)
        this.deleteEventUseCase = new DeleteEventUseCase(repository)
    }

    getEvents(): Promise<Event[]> {
        return this.getEventsUseCase.execute()
    }

    addEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
        return this.addEventUseCase.execute(data)
    }

    updateEvent(id: string, data: Partial<Event>): Promise<void> {
        return this.updateEventUseCase.execute(id, data)
    }

    deleteEvent(id: string): Promise<void> {
        return this.deleteEventUseCase.execute(id)
    }
}
