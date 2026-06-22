import path from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const dbPath = path.resolve(process.cwd(), 'data', 'spotify.db')
const sqlite = new Database(dbPath)

export const db = drizzle(sqlite, { schema })
