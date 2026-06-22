import { sqliteTable, text, integer, uniqueIndex, foreignKey } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { tracks } from './tracks'

export const listens = sqliteTable('listens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  trackId: text('track_id').notNull(),
  playedAt: integer('played_at', { mode: 'timestamp' }).notNull(),
  contextType: text('context_type'),
  contextUri: text('context_uri'),
  source: text('source').notNull().default('spotify'),
}, (table) => ({
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  trackFk: foreignKey({
    columns: [table.trackId],
    foreignColumns: [tracks.id],
  }).onDelete('cascade'),
  uniqueListen: uniqueIndex('listens_user_played_track_idx').on(table.userId, table.playedAt, table.trackId),
}))

export type Listen = typeof listens.$inferSelect
export type NewListen = typeof listens.$inferInsert
