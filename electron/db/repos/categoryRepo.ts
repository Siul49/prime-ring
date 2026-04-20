import type { DB } from '../index'

export interface CategoryRow {
    id: string
    name: string
    color: string
    icon: string | null
    order: number
}

interface RawRow {
    id: string
    name: string
    color: string
    icon: string | null
    order_idx: number
}

function rowFromDb(r: RawRow): CategoryRow {
    return { id: r.id, name: r.name, color: r.color, icon: r.icon, order: r.order_idx }
}

export function createCategoryRepo(db: DB) {
    const stmtList = db.prepare('SELECT * FROM categories ORDER BY order_idx ASC')
    const stmtUpsert = db.prepare(`
        INSERT INTO categories (id, name, color, icon, order_idx)
        VALUES (@id, @name, @color, @icon, @order)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            color = excluded.color,
            icon = excluded.icon,
            order_idx = excluded.order_idx
    `)
    const stmtDelete = db.prepare('DELETE FROM categories WHERE id = ?')

    return {
        list(): CategoryRow[] {
            return (stmtList.all() as RawRow[]).map(rowFromDb)
        },
        upsert(row: CategoryRow): void {
            stmtUpsert.run(row)
        },
        delete(id: string): void {
            stmtDelete.run(id)
        },
    }
}

export type CategoryRepo = ReturnType<typeof createCategoryRepo>
