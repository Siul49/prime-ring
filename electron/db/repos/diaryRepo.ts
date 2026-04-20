import type { DB } from '../index'

export type DiaryMood = 'happy' | 'neutral' | 'sad' | 'excited' | 'angry'
export type DiaryTemplate = 'morning' | 'weekly_retro' | 'free'

export interface DiaryRow {
    id: string
    date: string
    title: string
    content: string
    mood: DiaryMood
    templateType: DiaryTemplate | null
    createdAt: string
    updatedAt: string
}

interface RawRow {
    id: string
    date: string
    title: string
    content: string
    mood: string
    template_type: string | null
    created_at: string
    updated_at: string
}

function rowFromDb(r: RawRow): DiaryRow {
    return {
        id: r.id,
        date: r.date,
        title: r.title,
        content: r.content,
        mood: r.mood as DiaryMood,
        templateType: (r.template_type as DiaryTemplate | null) ?? null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    }
}

export function createDiaryRepo(db: DB) {
    const stmtList = db.prepare('SELECT * FROM diaries ORDER BY date DESC')
    const stmtGet = db.prepare('SELECT * FROM diaries WHERE id = ?')
    const stmtGetByDate = db.prepare('SELECT * FROM diaries WHERE date = ?')
    const stmtUpsert = db.prepare(`
        INSERT INTO diaries (id, date, title, content, mood, template_type, created_at, updated_at)
        VALUES (@id, @date, @title, @content, @mood, @templateType, @createdAt, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
            date = excluded.date,
            title = excluded.title,
            content = excluded.content,
            mood = excluded.mood,
            template_type = excluded.template_type,
            updated_at = excluded.updated_at
    `)
    const stmtDelete = db.prepare('DELETE FROM diaries WHERE id = ?')

    return {
        list(): DiaryRow[] {
            return (stmtList.all() as RawRow[]).map(rowFromDb)
        },
        get(id: string): DiaryRow | null {
            const r = stmtGet.get(id) as RawRow | undefined
            return r ? rowFromDb(r) : null
        },
        getByDate(date: string): DiaryRow | null {
            const r = stmtGetByDate.get(date) as RawRow | undefined
            return r ? rowFromDb(r) : null
        },
        upsert(row: DiaryRow): void {
            stmtUpsert.run({
                id: row.id,
                date: row.date,
                title: row.title,
                content: row.content,
                mood: row.mood,
                templateType: row.templateType,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            })
        },
        delete(id: string): void {
            stmtDelete.run(id)
        },
    }
}

export type DiaryRepo = ReturnType<typeof createDiaryRepo>
