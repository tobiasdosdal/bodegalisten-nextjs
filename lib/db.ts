import Database from 'better-sqlite3'
import path from 'path'

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'bodegalisten.db')
const db = new Database(dbPath)

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL')

export function queryMany<T>(sql: string, params?: unknown[]): T[] {
  const stmt = db.prepare(sql)
  return stmt.all(params) as T[]
}

export function queryOne<T>(sql: string, params?: unknown[]): T | null {
  const stmt = db.prepare(sql)
  return stmt.get(params) as T | null
}

export function execute(sql: string, params?: unknown[]): number {
  const stmt = db.prepare(sql)
  const result = stmt.run(params)
  return result.changes
}

export function query<T>(sql: string, params?: unknown[]): T[] {
  return queryMany<T>(sql, params)
}

// Helper for transactions
export function transaction<T>(fn: () => T): T {
  return db.transaction(fn)()
}

export default db
