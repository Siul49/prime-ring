import { ipcMain, dialog } from 'electron'
import { z, ZodError } from 'zod'
import type { DB } from './db'
import { createEventRepo, type EventRow } from './db/repos/eventRepo'
import { createDiaryRepo, type DiaryRow } from './db/repos/diaryRepo'
import { createCategoryRepo, type CategoryRow } from './db/repos/categoryRepo'
import {
    EventRowSchema,
    EventPatchSchema,
    DiaryRowSchema,
    CategoryRowSchema,
    IdSchema,
} from './db/schemas'
import * as authService from './auth/authService'

/**
 * Map raw better-sqlite3 / Node / OAuth errors to user-facing Korean messages.
 * Returns an object with both a friendly message (for toast) and the original
 * error message (for console/dev-tools).
 */
function mapDbError(err: unknown): { message: string; raw: string } {
    const raw = err instanceof Error ? err.message : String(err)

    if (err instanceof ZodError) {
        const first = err.issues[0]
        const path = first?.path.join('.') || '(root)'
        return {
            message: `잘못된 데이터 형식입니다 (${path}: ${first?.message ?? 'invalid'})`,
            raw,
        }
    }

    // OAuth / Google API
    if (raw.includes('Missing GOOGLE_CLIENT_ID')) {
        return { message: 'Google OAuth 자격증명이 설정되지 않았습니다 (.env.local 확인)', raw }
    }
    if (raw.includes('No refresh_token returned')) {
        return {
            message:
                'Google이 refresh token을 발급하지 않았습니다. https://myaccount.google.com/permissions 에서 PrimeRing 권한을 취소 후 다시 시도해주세요',
            raw,
        }
    }
    if (raw.includes('State mismatch')) {
        return { message: '인증 검증 실패 (CSRF 방어). 다시 시도해주세요', raw }
    }
    if (raw.includes('OAuth callback timed out')) {
        return { message: 'Google 로그인 시간이 초과되었습니다', raw }
    }
    if (raw.includes('OAuth provider returned error')) {
        return { message: 'Google 로그인이 거부되었습니다', raw }
    }
    if (raw.includes('invalid_grant')) {
        return { message: 'Google 인증이 만료되었습니다. 다시 로그인해주세요', raw }
    }

    if (raw.includes('UNIQUE constraint failed')) {
        if (raw.includes('diaries.date')) {
            return { message: '이미 그 날짜에 일기가 있습니다', raw }
        }
        if (raw.includes('events.google_event_id')) {
            return { message: '이미 동기화된 Google 일정과 충돌합니다', raw }
        }
        return { message: '중복된 항목입니다', raw }
    }

    if (raw.includes('NOT NULL constraint failed')) {
        return { message: '필수 항목이 비어있습니다', raw }
    }

    if (raw.includes('SQLITE_BUSY') || raw.includes('database is locked')) {
        return { message: '데이터베이스가 사용 중입니다. 잠시 후 다시 시도해주세요', raw }
    }

    if (raw.includes('SQLITE_FULL')) {
        return { message: '디스크 공간이 부족합니다', raw }
    }

    if (raw.includes('SQLITE_READONLY')) {
        return { message: '데이터베이스에 쓸 수 없습니다 (권한 확인 필요)', raw }
    }

    // Default: don't leak internals — generic message + log raw for dev
    return { message: '데이터 저장 중 오류가 발생했습니다', raw }
}

/**
 * Wrap an IPC handler with Zod validation + error mapping.
 * Returns { success, ...} envelopes consistently.
 */
function safeHandler<S extends z.ZodTypeAny, T>(
    schema: S,
    fn: (input: z.infer<S>) => T
) {
    return (_e: Electron.IpcMainInvokeEvent, raw: unknown) => {
        try {
            const input = schema.parse(raw)
            const data = fn(input)
            return data === undefined ? { success: true } : { success: true, data }
        } catch (err) {
            const { message, raw: rawMsg } = mapDbError(err)
            console.error(`IPC error: ${rawMsg}`)
            return { success: false, error: message }
        }
    }
}

function safeNoArg<T>(fn: () => T) {
    return () => {
        try {
            const data = fn()
            return data === undefined ? { success: true } : { success: true, data }
        } catch (err) {
            const { message, raw: rawMsg } = mapDbError(err)
            console.error(`IPC error: ${rawMsg}`)
            return { success: false, error: message }
        }
    }
}

function safeAsyncNoArg<T>(fn: () => Promise<T>) {
    return async () => {
        try {
            const data = await fn()
            return data === undefined ? { success: true } : { success: true, data }
        } catch (err) {
            const { message, raw: rawMsg } = mapDbError(err)
            console.error(`IPC error: ${rawMsg}`)
            return { success: false, error: message }
        }
    }
}

export function registerIpcHandlers(db: DB): void {
    const events = createEventRepo(db)
    const diaries = createDiaryRepo(db)
    const categories = createCategoryRepo(db)

    // events
    ipcMain.handle('events:list', safeNoArg(() => events.list()))
    ipcMain.handle('events:get', safeHandler(IdSchema, (id) => events.get(id)))
    ipcMain.handle(
        'events:upsert',
        safeHandler(EventRowSchema, (row) => events.upsert(row as EventRow))
    )
    ipcMain.handle(
        'events:patch',
        safeHandler(EventPatchSchema, ({ id, ...fields }) => {
            const result = events.patch(id, fields as Partial<EventRow>)
            if (!result) throw new Error(`Event ${id} not found`)
            return result
        })
    )
    ipcMain.handle('events:delete', safeHandler(IdSchema, (id) => events.delete(id)))

    // diaries
    ipcMain.handle('diaries:list', safeNoArg(() => diaries.list()))
    ipcMain.handle(
        'diaries:upsert',
        safeHandler(DiaryRowSchema, (row) => diaries.upsert(row as DiaryRow))
    )
    ipcMain.handle('diaries:delete', safeHandler(IdSchema, (id) => diaries.delete(id)))

    // categories
    ipcMain.handle('categories:list', safeNoArg(() => categories.list()))
    ipcMain.handle(
        'categories:upsert',
        safeHandler(CategoryRowSchema, (row) => categories.upsert(row as CategoryRow))
    )
    ipcMain.handle('categories:delete', safeHandler(IdSchema, (id) => categories.delete(id)))

    // auth (Phase 2 — Google OAuth)
    ipcMain.handle('auth:status', safeAsyncNoArg(() => authService.getStatus()))
    ipcMain.handle('auth:login', safeAsyncNoArg(() => authService.login()))
    ipcMain.handle('auth:logout', safeAsyncNoArg(() => authService.logout()))
}

export function showFatalDbError(err: Error): void {
    dialog.showErrorBox(
        'PrimeRing — 데이터베이스 오류',
        `로컬 데이터베이스를 열 수 없습니다.\n\n${err.message}\n\n문서 폴더의 PrimeRing 디렉토리 권한을 확인해주세요.`
    )
}
