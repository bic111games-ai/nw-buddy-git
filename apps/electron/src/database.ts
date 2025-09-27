import Database from 'better-sqlite3'
import * as path from 'path'
import { app } from 'electron'

// Determine the correct path to the database file.
// In development, the script runs from the project root.
// In production, the app is packaged, and the path is different.
const isDev = process.env['ELECTRON_SERVE'] === 'true'
const dbFileName = 'faktoria.sqlite'

// The python script places the db in `apps/electron/data/faktoria.sqlite`.
// The `angular.json` copies this to `/data/` in the output directory.
// In development, the output directory is `dist/web-standalone`.
// In production, it's in the resources directory.
const dbPath = isDev
  ? path.join(app.getAppPath(), '..', '..', 'apps', 'electron', 'data', dbFileName)
  : path.join(process.resourcesPath, 'data', dbFileName)

let db: Database.Database

export function connect() {
  try {
    db = new Database(dbPath, { readonly: true }) // Open in read-only mode
    console.log('Database connected successfully:', dbPath)
  } catch (error) {
    console.error('Failed to connect to the database:', error)
  }
}

export function close() {
  if (db && db.open) {
    db.close()
    console.log('Database connection closed.')
  }
}

export function getAukcje(options: {
  limit: number
  offset: number
  sort?: string
  sortOrder?: 'ASC' | 'DESC'
  nameFilter?: string
}) {
  if (!db) {
    connect()
  }
  const { limit, offset, sort = 'price', sortOrder = 'ASC', nameFilter } = options
  const params: any[] = []
  let sql = `SELECT * FROM aukcje`

  if (nameFilter) {
    sql += ` WHERE item_name LIKE ?`
    params.push(`%${nameFilter}%`)
  }

  sql += ` ORDER BY ${sort} ${sortOrder} LIMIT ? OFFSET ?`
  params.push(limit, offset)

  try {
    const stmt = db.prepare(sql)
    const rows = stmt.all(params)
    const totalStmt = db.prepare(`SELECT COUNT(*) as count FROM aukcje ${nameFilter ? 'WHERE item_name LIKE ?' : ''}`)
    const total = totalStmt.get(nameFilter ? `%${nameFilter}%` : []) as { count: number }
    return { rows, total: total.count }
  } catch (error) {
    console.error(`Error fetching 'aukcje':`, error)
    return { rows: [], total: 0 }
  }
}

export function getZleceniaKupna(options: {
  limit: number
  offset: number
  sort?: string
  sortOrder?: 'ASC' | 'DESC'
  nameFilter?: string
}) {
  if (!db) {
    connect()
  }
  const { limit, offset, sort = 'price', sortOrder = 'DESC', nameFilter } = options
  const params: any[] = []
  let sql = `SELECT * FROM zlecenia_kupna`

  if (nameFilter) {
    sql += ` WHERE item_name LIKE ?`
    params.push(`%${nameFilter}%`)
  }

  sql += ` ORDER BY ${sort} ${sortOrder} LIMIT ? OFFSET ?`
  params.push(limit, offset)

  try {
    const stmt = db.prepare(sql)
    const rows = stmt.all(params)
    const totalStmt = db.prepare(
      `SELECT COUNT(*) as count FROM zlecenia_kupna ${nameFilter ? 'WHERE item_name LIKE ?' : ''}`,
    )
    const total = totalStmt.get(nameFilter ? `%${nameFilter}%` : []) as { count: number }
    return { rows, total: total.count }
  } catch (error) {
    console.error(`Error fetching 'zlecenia_kupna':`, error)
    return { rows: [], total: 0 }
  }
}
