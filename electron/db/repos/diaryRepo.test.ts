import { test } from 'node:test'
import assert from 'node:assert'
import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import { runMigrations } from '../migrate.ts'
import { createDiaryRepo, type DiaryRow } from './diaryRepo.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS = path.join(HERE, '..', 'migrations')

function freshDb() {
    const db = new Database(':memory:')
    runMigrations(db, MIGRATIONS)
    return db
}

function sample(overrides: Partial<DiaryRow> = {}): DiaryRow {
    return {
        id: 'd-1',
        date: '2026-04-17',
        title: '좋은 하루',
        content: '뭐 좀 했다',
        mood: 'happy',
        templateType: null,
        createdAt: '2026-04-17T22:00:00.000Z',
        updatedAt: '2026-04-17T22:00:00.000Z',
        ...overrides,
    }
}

test('diaryRepo', async (t) => {
    await t.test('upsert + getByDate', () => {
        const db = freshDb()
        const repo = createDiaryRepo(db)
        repo.upsert(sample())
        const byDate = repo.getByDate('2026-04-17')
        assert.ok(byDate)
        assert.strictEqual(byDate!.title, '좋은 하루')
        db.close()
    })

    await t.test('inserting different id with same date throws UNIQUE constraint', () => {
        const db = freshDb()
        const repo = createDiaryRepo(db)
        repo.upsert(sample())
        assert.throws(
            () => repo.upsert(sample({ id: 'd-2' })),
            /UNIQUE constraint failed/
        )
        db.close()
    })

    await t.test('upsert by same id updates row', () => {
        const db = freshDb()
        const repo = createDiaryRepo(db)
        repo.upsert(sample())
        repo.upsert(sample({ title: '수정됨', updatedAt: '2026-04-18T00:00:00.000Z' }))
        const got = repo.getByDate('2026-04-17')!
        assert.strictEqual(got.title, '수정됨')
        db.close()
    })

    await t.test('template types roundtrip', () => {
        const db = freshDb()
        const repo = createDiaryRepo(db)
        repo.upsert(sample({ templateType: 'morning' }))
        repo.upsert(sample({ id: 'd-2', date: '2026-04-20', templateType: 'weekly_retro' }))
        const list = repo.list()
        assert.strictEqual(list.length, 2)
        assert.strictEqual(list.find(d => d.id === 'd-1')!.templateType, 'morning')
        assert.strictEqual(list.find(d => d.id === 'd-2')!.templateType, 'weekly_retro')
        db.close()
    })
})
