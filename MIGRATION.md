# DDD Migration Map

## Layer introduction
- `src/domain`: domain models by bounded context (`calendar/events`, `diary`, `settings`, `shared`)
- `src/application`: application services/use-cases by bounded context
- `src/infrastructure`: persistence/composition by bounded context + shared infra
- `src/presentation`: UI split by bounded context + shared UI

## Old -> New paths
- `src/App.tsx` -> `src/presentation/App.tsx` (shim remains at `src/App.tsx`)
- `src/main.tsx` -> `src/presentation/main.tsx` (shim remains at `src/main.tsx`)
- `src/App.css` -> `src/presentation/App.css`
- `src/index.css` -> `src/presentation/index.css`
- `src/types/index.ts` -> `src/domain/types.ts` (`src/types/index.ts` now re-exports domain types)

### Domain
- `src/domain/entities/eventEntity.ts` -> `src/domain/calendar/events/eventEntity.ts`
- `src/domain/repositories/eventRepository.ts` -> `src/domain/calendar/events/eventRepository.ts`
- `src/domain/entities/diaryEntity.ts` -> `src/domain/diary/diaryEntity.ts`
- `src/domain/repositories/diaryRepository.ts` -> `src/domain/diary/diaryRepository.ts`
- Domain type split:
  - `src/domain/calendar/events/eventTypes.ts`
  - `src/domain/diary/diaryTypes.ts`
  - `src/domain/settings/settingsTypes.ts`
  - `src/domain/shared/index.ts`

### Application
- `src/application/services/eventApplicationService.ts` -> `src/application/calendar/events/eventApplicationService.ts`
- `src/application/use-cases/events/*` -> `src/application/calendar/events/use-cases/*`
- `src/application/services/diaryApplicationService.ts` -> `src/application/diary/diaryApplicationService.ts`
- `src/application/use-cases/diaries/*` -> `src/application/diary/use-cases/*`

### Infrastructure
- `src/infrastructure/repositories/eventJsonRepository.ts` -> `src/infrastructure/calendar/events/eventJsonRepository.ts`
- `src/infrastructure/repositories/diaryJsonRepository.ts` -> `src/infrastructure/diary/diaryJsonRepository.ts`
- `src/infrastructure/storage/jsonFileGateway.ts` -> `src/infrastructure/shared/storage/jsonFileGateway.ts`
- `src/infrastructure/composition/serviceRegistry.ts` -> `src/infrastructure/shared/composition/serviceRegistry.ts`

### Presentation
- `src/presentation/components/calendar/*` and `src/presentation/components/list/*` -> `src/presentation/calendar/events/components/*`
- `src/presentation/hooks/useEvents.ts` -> `src/presentation/calendar/events/hooks/useEvents.ts`
- `src/presentation/stores/eventStore.ts` -> `src/presentation/calendar/events/stores/eventStore.ts`
- `src/presentation/stores/modalStore.ts` -> `src/presentation/calendar/events/stores/modalStore.ts`
- `src/presentation/components/diary/*` -> `src/presentation/diary/components/*`
- `src/presentation/hooks/useDiaries.ts` -> `src/presentation/diary/hooks/useDiaries.ts`
- `src/presentation/stores/diaryStore.ts` -> `src/presentation/diary/stores/diaryStore.ts`
- `src/presentation/components/settings/*` -> `src/presentation/settings/components/*`
- `src/presentation/hooks/useTheme.ts` -> `src/presentation/settings/hooks/useTheme.ts`
- `src/presentation/stores/themeStore.ts` -> `src/presentation/settings/stores/themeStore.ts`
- `src/presentation/stores/categoryStore.ts` -> `src/presentation/settings/stores/categoryStore.ts`
- `src/presentation/stores/appStore.ts` -> `src/presentation/settings/stores/appStore.ts`
- `src/presentation/components/common/*` -> `src/presentation/shared/components/common/*`
- `src/presentation/components/layout/*` -> `src/presentation/shared/components/layout/*`
- `src/presentation/components/sidebar/*` -> `src/presentation/shared/components/sidebar/*`
