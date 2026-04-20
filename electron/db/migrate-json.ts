import fs from 'fs'
import path from 'path'
import type { DB } from './index'

export interface JsonMigrationResult {
    attempted: boolean
    events: number
    diaries: number
    error?: string
}

function isoOrNow(v: unknown): string {
    if (typeof v === 'string') return v
    if (v instanceof Date) return v.toISOString()
    return new Date().toISOString()
}

function readJsonIfExists<T>(filePath: string): T[] | null {
    if (!fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, 'utf-8').trim()
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error(`Expected array in ${path.basename(filePath)}`)
    return parsed as T[]
}

function alreadyMigrated(db: DB): boolean {
    const hasTable = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_meta'")
        .get()
    if (!hasTable) return false
    const row = db
        .prepare("SELECT value FROM schema_meta WHERE key='json_migrated_at'")
        .get() as { value: string } | undefined
    return !!row
}

function markMigrated(db: DB): void {
    db.prepare(
        "INSERT INTO schema_meta (key, value) VALUES ('json_migrated_at', ?) " +
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).run(new Date().toISOString())
}

export function migrateJsonToSqlite(db: DB, dataDir: string): JsonMigrationResult {
    if (alreadyMigrated(db)) {
        return { attempted: false, events: 0, diaries: 0 }
    }

    const eventsPath = path.join(dataDir, 'events.json')
    const diariesPath = path.join(dataDir, 'diaries.json')

    let rawEvents: any[] | null
    let rawDiaries: any[] | null

    try {
        rawEvents = readJsonIfExists<any>(eventsPath)
        rawDiaries = readJsonIfExists<any>(diariesPath)
    } catch (err) {
        return {
            attempted: true,
            events: 0,
            diaries: 0,
            error: `Parse failed: ${(err as Error).message}`,
        }
    }

    if (rawEvents === null && rawDiaries === null) {
        markMigrated(db)
        return { attempted: true, events: 0, diaries: 0 }
    }

    const insertEvent = db.prepare(`
        INSERT OR REPLACE INTO events (
            id, title, description, start_date, end_date, all_day,
            category_id, tags, color, priority,
            recurrence_rrule, recurrence_exceptions, metadata,
            google_event_id, etag, sync_state, last_synced_at,
            created_at, updated_at
        ) VALUES (
            @id, @title, @description, @start_date, @end_date, @all_day,
            @category_id, @tags, @color, @priority,
            @recurrence_rrule, @recurrence_exceptions, @metadata,
            @google_event_id, @etag, @sync_state, @last_synced_at,
            @created_at, @updated_at
        )
    `)
    const insertDiary = db.prepare(`
        INSERT OR REPLACE INTO diaries (id, date, title, content, mood, template_type, created_at, updated_at)
        VALUES (@id, @date, @title, @content, @mood, @template_type, @created_at, @updated_at)
    `)

    let eventCount = 0
    let diaryCount = 0

    try {
        const tx = db.transaction(() => {
            for (const e of rawEvents ?? []) {
                insertEvent.run({
                    id: e.id ?? crypto.randomUUID(),
                    title: e.title ?? '(제목 없음)',
                    description: e.description ?? null,
                    start_date: isoOrNow(e.startDate),
                    end_date: isoOrNow(e.endDate ?? e.startDate),
                    all_day: e.allDay ? 1 : 0,
                    category_id: e.categoryId ?? null,
                    tags: JSON.stringify(e.tags ?? []),
                    color: e.color ?? null,
                    priority: e.priority ?? 'medium',
                    recurrence_rrule: null,
                    recurrence_exceptions: e.recurrence?.exceptions
                        ? JSON.stringify(e.recurrence.exceptions)
                        : null,
                    metadata: e.metadata ? JSON.stringify(e.metadata) : null,
                    google_event_id: null,
                    etag: null,
                    sync_state: 'local',
                    last_synced_at: null,
                    created_at: isoOrNow(e.createdAt),
                    updated_at: isoOrNow(e.updatedAt),
                })
                eventCount++
            }
            // Last-Write-Wins for duplicate dates: pre-sort + dedupe by date
            // (UNIQUE(date) constraint would otherwise abort the entire transaction).
            const dedupedDiaries = new Map<string, any>()
            for (const d of rawDiaries ?? []) {
                const dateStr =
                    typeof d.date === 'string'
                        ? d.date.slice(0, 10)
                        : new Date(d.date).toISOString().slice(0, 10)
                const existing = dedupedDiaries.get(dateStr)
                if (!existing) {
                    dedupedDiaries.set(dateStr, { ...d, _dateStr: dateStr })
                    continue
                }
                // Keep the entry with the most recent updatedAt
                const incomingTs = new Date(isoOrNow(d.updatedAt)).getTime()
                const existingTs = new Date(isoOrNow(existing.updatedAt)).getTime()
                if (incomingTs >= existingTs) {
                    dedupedDiaries.set(dateStr, { ...d, _dateStr: dateStr })
                    console.warn(
                        `⚠️  Duplicate diary date ${dateStr} in JSON; kept newer entry (id=${d.id}).`
                    )
                } else {
                    console.warn(
                        `⚠️  Duplicate diary date ${dateStr} in JSON; kept newer entry (id=${existing.id}).`
                    )
                }
            }
            for (const d of dedupedDiaries.values()) {
                insertDiary.run({
                    id: d.id ?? crypto.randomUUID(),
                    date: d._dateStr,
                    title: d.title ?? '',
                    content: d.content ?? '',
                    mood: d.mood ?? 'neutral',
                    template_type: d.templateType ?? null,
                    created_at: isoOrNow(d.createdAt),
                    updated_at: isoOrNow(d.updatedAt),
                })
                diaryCount++
            }
            markMigrated(db)
        })
        tx()
    } catch (err) {
        // Preserve full stack trace for debugging
        console.error('❌ JSON migration transaction failed:', err)
        return {
            attempted: true,
            events: 0,
            diaries: 0,
            error: `Transaction failed: ${(err as Error).message}`,
        }
    }

    // Success — rename JSON files to .bak for safekeeping
    try {
        if (rawEvents !== null && fs.existsSync(eventsPath)) {
            fs.renameSync(eventsPath, eventsPath + '.bak')
        }
        if (rawDiaries !== null && fs.existsSync(diariesPath)) {
            fs.renameSync(diariesPath, diariesPath + '.bak')
        }
    } catch (err) {
        // Rename failure is non-fatal — data is already in the DB.
        // Warn loudly so user can manually clean up the leftover JSON file.
        console.warn(
            '⚠️  JSON files migrated but rename to .bak failed. ' +
                'Original JSON files still present in data dir but no longer used. ' +
                'Manually rename or delete them. Error:',
            err
        )
    }

    return { attempted: true, events: eventCount, diaries: diaryCount }
}
