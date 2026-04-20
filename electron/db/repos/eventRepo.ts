import type { DB } from '../index'

export type SyncState = 'local' | 'synced' | 'dirty' | 'deleted'

export interface EventRow {
    id: string
    title: string
    description: string | null
    startDate: string
    endDate: string
    allDay: boolean
    categoryId: string | null
    tags: string[]
    color: string | null
    priority: 'low' | 'medium' | 'high'
    recurrenceRrule: string | null
    recurrenceExceptions: string[] | null
    metadata: Record<string, unknown> | null
    googleEventId: string | null
    etag: string | null
    syncState: SyncState
    lastSyncedAt: string | null
    createdAt: string
    updatedAt: string
}

interface RawRow {
    id: string
    title: string
    description: string | null
    start_date: string
    end_date: string
    all_day: number
    category_id: string | null
    tags: string
    color: string | null
    priority: string
    recurrence_rrule: string | null
    recurrence_exceptions: string | null
    metadata: string | null
    google_event_id: string | null
    etag: string | null
    sync_state: string
    last_synced_at: string | null
    created_at: string
    updated_at: string
}

function rowFromDb(r: RawRow): EventRow {
    return {
        id: r.id,
        title: r.title,
        description: r.description,
        startDate: r.start_date,
        endDate: r.end_date,
        allDay: r.all_day === 1,
        categoryId: r.category_id,
        tags: JSON.parse(r.tags),
        color: r.color,
        priority: (r.priority as EventRow['priority']) ?? 'medium',
        recurrenceRrule: r.recurrence_rrule,
        recurrenceExceptions: r.recurrence_exceptions ? JSON.parse(r.recurrence_exceptions) : null,
        metadata: r.metadata ? JSON.parse(r.metadata) : null,
        googleEventId: r.google_event_id,
        etag: r.etag,
        syncState: r.sync_state as SyncState,
        lastSyncedAt: r.last_synced_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    }
}

export function createEventRepo(db: DB) {
    const stmtList = db.prepare('SELECT * FROM events ORDER BY start_date ASC')
    const stmtGet = db.prepare('SELECT * FROM events WHERE id = ?')
    const stmtUpsert = db.prepare(`
        INSERT INTO events (
            id, title, description, start_date, end_date, all_day,
            category_id, tags, color, priority,
            recurrence_rrule, recurrence_exceptions, metadata,
            google_event_id, etag, sync_state, last_synced_at,
            created_at, updated_at
        ) VALUES (
            @id, @title, @description, @startDate, @endDate, @allDay,
            @categoryId, @tags, @color, @priority,
            @recurrenceRrule, @recurrenceExceptions, @metadata,
            @googleEventId, @etag, @syncState, @lastSyncedAt,
            @createdAt, @updatedAt
        )
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            start_date = excluded.start_date,
            end_date = excluded.end_date,
            all_day = excluded.all_day,
            category_id = excluded.category_id,
            tags = excluded.tags,
            color = excluded.color,
            priority = excluded.priority,
            recurrence_rrule = excluded.recurrence_rrule,
            recurrence_exceptions = excluded.recurrence_exceptions,
            metadata = excluded.metadata,
            google_event_id = excluded.google_event_id,
            etag = excluded.etag,
            sync_state = excluded.sync_state,
            last_synced_at = excluded.last_synced_at,
            updated_at = excluded.updated_at
    `)
    const stmtDelete = db.prepare('DELETE FROM events WHERE id = ?')

    return {
        list(): EventRow[] {
            return (stmtList.all() as RawRow[]).map(rowFromDb)
        },
        get(id: string): EventRow | null {
            const r = stmtGet.get(id) as RawRow | undefined
            return r ? rowFromDb(r) : null
        },
        upsert(row: EventRow): void {
            stmtUpsert.run({
                id: row.id,
                title: row.title,
                description: row.description,
                startDate: row.startDate,
                endDate: row.endDate,
                allDay: row.allDay ? 1 : 0,
                categoryId: row.categoryId,
                tags: JSON.stringify(row.tags),
                color: row.color,
                priority: row.priority,
                recurrenceRrule: row.recurrenceRrule,
                recurrenceExceptions: row.recurrenceExceptions
                    ? JSON.stringify(row.recurrenceExceptions)
                    : null,
                metadata: row.metadata ? JSON.stringify(row.metadata) : null,
                googleEventId: row.googleEventId,
                etag: row.etag,
                syncState: row.syncState,
                lastSyncedAt: row.lastSyncedAt,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            })
        },
        delete(id: string): void {
            stmtDelete.run(id)
        },
        /**
         * Atomic patch: read-modify-write inside a single transaction so two
         * concurrent updates can't lose each other's changes.
         */
        patch(id: string, fields: Partial<EventRow>): EventRow | null {
            const tx = db.transaction((): EventRow | null => {
                const existing = stmtGet.get(id) as RawRow | undefined
                if (!existing) return null
                const current = rowFromDb(existing)
                const merged: EventRow = {
                    ...current,
                    ...fields,
                    id,
                    syncState:
                        fields.syncState ??
                        (current.syncState === 'synced' ? 'dirty' : current.syncState),
                    updatedAt: fields.updatedAt ?? new Date().toISOString(),
                }
                stmtUpsert.run({
                    id: merged.id,
                    title: merged.title,
                    description: merged.description,
                    startDate: merged.startDate,
                    endDate: merged.endDate,
                    allDay: merged.allDay ? 1 : 0,
                    categoryId: merged.categoryId,
                    tags: JSON.stringify(merged.tags),
                    color: merged.color,
                    priority: merged.priority,
                    recurrenceRrule: merged.recurrenceRrule,
                    recurrenceExceptions: merged.recurrenceExceptions
                        ? JSON.stringify(merged.recurrenceExceptions)
                        : null,
                    metadata: merged.metadata ? JSON.stringify(merged.metadata) : null,
                    googleEventId: merged.googleEventId,
                    etag: merged.etag,
                    syncState: merged.syncState,
                    lastSyncedAt: merged.lastSyncedAt,
                    createdAt: merged.createdAt,
                    updatedAt: merged.updatedAt,
                })
                return merged
            })
            return tx()
        },
    }
}

export type EventRepo = ReturnType<typeof createEventRepo>
