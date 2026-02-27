import { DiaryApplicationService } from '../../../application/diary/diaryApplicationService'
import { EventApplicationService } from '../../../application/calendar/events/eventApplicationService'
import { DiaryJsonRepository } from '../../diary/diaryJsonRepository'
import { EventJsonRepository } from '../../calendar/events/eventJsonRepository'
import { JsonFileGateway } from '../storage/jsonFileGateway'

const gateway = new JsonFileGateway()

const eventRepository = new EventJsonRepository(gateway)
const diaryRepository = new DiaryJsonRepository(gateway)

export const eventApplicationService = new EventApplicationService(eventRepository)
export const diaryApplicationService = new DiaryApplicationService(diaryRepository)
