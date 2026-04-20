import fs from 'fs'
import path from 'path'
import type { DB } from './index'

function readVersion(db: DB): number {
    const hasTable = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_meta'")
        .get()
    if (!hasTable) return 0
    const row = db.prepare("SELECT value FROM schema_meta WHERE key='version'").get() as
        | { value: string }
        | undefined
    return row ? parseInt(row.value, 10) : 0
}

function writeVersion(db: DB, version: number): void {
    db.prepare(
        "INSERT INTO schema_meta (key, value) VALUES ('version', ?) " +
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).run(String(version))
}

export function listMigrations(dir: string): Array<{ version: number; file: string }> {
    if (!fs.existsSync(dir)) return []
    return fs
        .readdirSync(dir)
        .filter((f) => /^\d{3}_.+\.sql$/.test(f))
        .sort()
        .map((file) => ({
            version: parseInt(file.slice(0, 3), 10),
            file: path.join(dir, file),
        }))
}

export function runMigrations(db: DB, dir: string): number {
    const current = readVersion(db)
    const migrations = listMigrations(dir)
    let applied = current

    for (const m of migrations) {
        if (m.version <= current) continue
        const sql = fs.readFileSync(m.file, 'utf-8')
        const tx = db.transaction(() => {
            db.exec(sql)
            writeVersion(db, m.version)
        })
        tx()
        applied = m.version
    }
    return applied
}
