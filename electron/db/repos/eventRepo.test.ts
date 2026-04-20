import { test } from 'node:test'
import assert from 'node:assert'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import { runMigrations } from '../migrate.ts'
import { createEventRepo, type EventRow } from './eventRepo.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS = path.join(HERE, '..', 'migrations')

function freshDb() {
    const db = new Database(':memory:')
    runMigrations(db, MIGRATIONS)
    return db
}

function sample(overrides: Partial<EventRow> = {}): EventRow {
    return {
        id: 'ev-1',
        title: '회의',
        description: null,
        startDate: '2026-04-17T09:00:00.000Z',
        endDate: '2026-04-17T10:00:00.000Z',
        allDay: false,
        categoryId: 'work',
        tags: ['office'],
        color: null,
        priority: 'medium',
        recurrenceRrule: null,
        recurrenceExceptions: null,
        metadata: null,
        googleEventId: null,
        etag: null,
        syncState: 'local',
        lastSyncedAt: null,
        createdAt: '2026-04-17T08:00:00.000Z',
        updatedAt: '2026-04-17T08:00:00.000Z',
        ...overrides,
    }
}

test('eventRepo', async (t) => {
    await t.test('list returns [] on empty DB', () => {
        const db = freshDb()
        const repo = createEventRepo(db)
        assert.deepStrictEqual(repo.list(), [])
        db.close()
    })

    await t.test('upsert inserts, list returns row, get by id works', () => {
        const db = freshDb()
        const repo = createEventRepo(db)
        repo.upsert(sample())
        const all = repo.list()
        assert.strictEqual(all.length, 1)
        assert.strictEqual(all[0].title, '회의')
        assert.deepStrictEqual(all[0].tags, ['office'])
        const one = repo.get('ev-1')
        assert.ok(one)
        assert.strictEqual(one!.id, 'ev-1')
        db.close()
    })

    await t.test('upsert updates existing row', () => {
        const db = freshDb()
        const repo = createEventRepo(db)
        repo.upsert(sample())
        repo.upsert(sample({ title: '수정된 회의', updatedAt: '2026-04-17T11:00:00.000Z' }))
        const one = repo.get('ev-1')
        assert.strictEqual(one!.title, '수정된 회의')
        assert.strictEqual(repo.list().length, 1)
        db.close()
    })

    await t.test('roundtrip: all fields preserved including JSON blobs', () => {
        const db = freshDb()
        const repo = createEventRepo(db)
        const row = sample({
            tags: ['a', 'b'],
            metadata: { reminder: { type: 'email', value: 15 } },
            recurrenceRrule: 'FREQ=WEEKLY;BYDAY=MO',
            recurrenceExceptions: ['2026-04-20'],
            allDay: true,
        })
        repo.upsert(row)
        const got = repo.get('ev-1')!
        assert.deepStrictEqual(got.tags, ['a', 'b'])
        assert.deepStrictEqual(got.metadata, { reminder: { type: 'email', value: 15 } })
        assert.strictEqual(got.recurrenceRrule, 'FREQ=WEEKLY;BYDAY=MO')
        assert.deepStrictEqual(got.recurrenceExceptions, ['2026-04-20'])
        assert.strictEqual(got.allDay, true)
        db.close()
    })

    await t.test('delete removes the row', () => {
        const db = freshDb()
        const repo = createEventRepo(db)
        repo.upsert(sample())
        repo.delete('ev-1')
        assert.strictEqual(repo.list().length, 0)
        assert.strictEqual(repo.get('ev-1'), null)
        db.close()
    })

    await t.test('patch updates only specified fields atomically', () => {
        const db = freshDb()
        const repo = createEventRepo(db)
        repo.upsert(sample({ title: '원본', tags: ['x'] }))
        const result = repo.patch('ev-1', { title: '변경' })
        assert.ok(result)
        assert.strictEqual(result!.title, '변경')
        assert.deepStrictEqual(result!.tags, ['x'])
        const got = repo.get('ev-1')!
        assert.strictEqual(got.title, '변경')
        assert.deepStrictEqual(got.tags, ['x'])
        db.close()
    })

    await t.test('patch flips synced → dirty when changing fields', () => {
        const db = freshDb()
        const repo = createEventRepo(db)
        repo.upsert(sample({ syncState: 'synced' }))
        const result = repo.patch('ev-1', { title: '변경' })
        assert.strictEqual(result!.syncState, 'dirty')
        db.close()
    })

    await t.test('patch returns null for non-existent id', () => {
        const db = freshDb()
        const repo = createEventRepo(db)
        const result = repo.patch('does-not-exist', { title: 'x' })
        assert.strictEqual(result, null)
        db.close()
    })
})
