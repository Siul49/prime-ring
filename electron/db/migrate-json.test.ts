import { test } from 'node:test'
import assert from 'node:assert'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import { runMigrations } from './migrate.ts'
import { migrateJsonToSqlite } from './migrate-json.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS = path.join(HERE, 'migrations')

function freshDb() {
    const db = new Database(':memory:')
    runMigrations(db, MIGRATIONS)
    return db
}

function tmpDir(): string {
    const dir = path.join(
        os.tmpdir(),
        `primering-json-${Date.now()}-${Math.random().toString(36).slice(2)}`
    )
    fs.mkdirSync(dir, { recursive: true })
    return dir
}

test('migrateJsonToSqlite', async (t) => {
    await t.test('no json files → no-op, marks migrated', () => {
        const db = freshDb()
        const dir = tmpDir()
        try {
            const r = migrateJsonToSqlite(db, dir)
            assert.strictEqual(r.attempted, true)
            assert.strictEqual(r.events, 0)
            assert.strictEqual(r.diaries, 0)
            // Second call: already migrated → not attempted again
            const r2 = migrateJsonToSqlite(db, dir)
            assert.strictEqual(r2.attempted, false)
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
            db.close()
        }
    })

    await t.test('happy path: events + diaries migrated, JSON renamed to .bak', () => {
        const db = freshDb()
        const dir = tmpDir()
        try {
            const events = [
                {
                    id: 'e1',
                    title: '회의',
                    startDate: '2026-04-17T09:00:00.000Z',
                    endDate: '2026-04-17T10:00:00.000Z',
                    allDay: false,
                    categoryId: 'work',
                    tags: ['t1'],
                    priority: 'medium',
                    userId: 'demo',
                    createdAt: '2026-04-17T08:00:00.000Z',
                    updatedAt: '2026-04-17T08:00:00.000Z',
                },
            ]
            const diaries = [
                {
                    id: 'd1',
                    date: '2026-04-17',
                    title: '제목',
                    content: '본문',
                    mood: 'happy',
                    createdAt: '2026-04-17T22:00:00.000Z',
                    updatedAt: '2026-04-17T22:00:00.000Z',
                },
            ]
            fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify(events))
            fs.writeFileSync(path.join(dir, 'diaries.json'), JSON.stringify(diaries))

            const r = migrateJsonToSqlite(db, dir)
            assert.strictEqual(r.events, 1)
            assert.strictEqual(r.diaries, 1)
            assert.strictEqual(r.error, undefined)

            const eventRow = db.prepare('SELECT * FROM events WHERE id = ?').get('e1') as any
            assert.strictEqual(eventRow.title, '회의')
            assert.strictEqual(eventRow.sync_state, 'local')

            const diaryRow = db.prepare('SELECT * FROM diaries WHERE id = ?').get('d1') as any
            assert.strictEqual(diaryRow.date, '2026-04-17')

            assert.ok(!fs.existsSync(path.join(dir, 'events.json')))
            assert.ok(fs.existsSync(path.join(dir, 'events.json.bak')))
            assert.ok(fs.existsSync(path.join(dir, 'diaries.json.bak')))
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
            db.close()
        }
    })

    await t.test('corrupted JSON → rollback, no marker, no rename, error reported', () => {
        const db = freshDb()
        const dir = tmpDir()
        try {
            fs.writeFileSync(path.join(dir, 'events.json'), '{not valid json')
            const r = migrateJsonToSqlite(db, dir)
            assert.strictEqual(r.events, 0)
            assert.ok(r.error)

            // Marker must NOT be set → next call should attempt again
            const r2 = migrateJsonToSqlite(db, dir)
            assert.strictEqual(r2.attempted, true)

            // events.json must still be there (no rename on failure)
            assert.ok(fs.existsSync(path.join(dir, 'events.json')))
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
            db.close()
        }
    })

    await t.test('duplicate diary dates → LWW (latest updatedAt kept)', () => {
        const db = freshDb()
        const dir = tmpDir()
        try {
            const diaries = [
                {
                    id: 'd-old',
                    date: '2026-04-17',
                    title: '오래된',
                    content: 'old',
                    mood: 'neutral',
                    createdAt: '2026-04-17T08:00:00.000Z',
                    updatedAt: '2026-04-17T08:00:00.000Z',
                },
                {
                    id: 'd-new',
                    date: '2026-04-17',
                    title: '최신',
                    content: 'new',
                    mood: 'happy',
                    createdAt: '2026-04-17T08:00:00.000Z',
                    updatedAt: '2026-04-17T22:00:00.000Z',
                },
            ]
            fs.writeFileSync(path.join(dir, 'diaries.json'), JSON.stringify(diaries))

            const r = migrateJsonToSqlite(db, dir)
            assert.strictEqual(r.diaries, 1)
            const row = db.prepare('SELECT * FROM diaries WHERE date = ?').get('2026-04-17') as any
            assert.strictEqual(row.id, 'd-new')
            assert.strictEqual(row.title, '최신')
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
            db.close()
        }
    })

    await t.test('empty arrays → migration succeeds with 0 counts', () => {
        const db = freshDb()
        const dir = tmpDir()
        try {
            fs.writeFileSync(path.join(dir, 'events.json'), '[]')
            fs.writeFileSync(path.join(dir, 'diaries.json'), '[]')
            const r = migrateJsonToSqlite(db, dir)
            assert.strictEqual(r.events, 0)
            assert.strictEqual(r.diaries, 0)
            assert.strictEqual(r.error, undefined)
            assert.ok(fs.existsSync(path.join(dir, 'events.json.bak')))
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
            db.close()
        }
    })
})
