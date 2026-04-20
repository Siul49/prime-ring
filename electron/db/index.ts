import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

export type DB = Database.Database

let instance: DB | null = null

export function openDb(dbPath: string): DB {
    const dir = path.dirname(dbPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    db.pragma('synchronous = NORMAL')
    return db
}

export function getDb(): DB {
    if (!instance) throw new Error('DB not initialized. Call initDb() first.')
    return instance
}

export function setDb(db: DB): void {
    instance = db
}

export function closeDb(): void {
    if (instance) {
        instance.close()
        instance = null
    }
}
