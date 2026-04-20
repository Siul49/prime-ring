import { test } from 'node:test'
import assert from 'node:assert'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import { runMigrations, listMigrations } from './migrate.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_MIGRATIONS = path.join(HERE, 'migrations')

function tmpDbPath(): string {
    return path.join(os.tmpdir(), `primering-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
}

test('migrate runner', async (t) => {
    await t.test('lists migrations sorted by version', () => {
        const list = listMigrations(PROJECT_MIGRATIONS)
        assert.ok(list.length >= 1)
        assert.strictEqual(list[0].version, 1)
    })

    await t.test('applies v0 → v1 to an empty DB', () => {
        const p = tmpDbPath()
        try {
            const db = new Database(p)
            const applied = runMigrations(db, PROJECT_MIGRATIONS)
            assert.strictEqual(applied, 1)

            const tables = db
                .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
                .all() as Array<{ name: string }>
            const names = tables.map((r) => r.name)
            assert.ok(names.includes('events'))
            assert.ok(names.includes('diaries'))
            assert.ok(names.includes('categories'))
            assert.ok(names.includes('schema_meta'))

            const version = db
                .prepare("SELECT value FROM schema_meta WHERE key='version'")
                .get() as { value: string }
            assert.strictEqual(version.value, '1')
            db.close()
        } finally {
            fs.rmSync(p, { force: true })
            fs.rmSync(p + '-wal', { force: true })
            fs.rmSync(p + '-shm', { force: true })
        }
    })

    await t.test('idempotent: running twice does not re-apply', () => {
        const p = tmpDbPath()
        try {
            const db = new Database(p)
            runMigrations(db, PROJECT_MIGRATIONS)
            const applied2 = runMigrations(db, PROJECT_MIGRATIONS)
            assert.strictEqual(applied2, 1)
            db.close()
        } finally {
            fs.rmSync(p, { force: true })
            fs.rmSync(p + '-wal', { force: true })
            fs.rmSync(p + '-shm', { force: true })
        }
    })
})
