import { sqliteTable, text, integer, primaryKey, foreignKey } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const dailyStats = sqliteTable('daily_stats', {
  userId: text('user_id').notNull(),
  date: text('date').notNull(),
  trackCount: integer('track_count').notNull().default(0),
  uniqueTracks: integer('unique_tracks').notNull().default(0),
  uniqueArtists: integer('unique_artists').notNull().default(0),
  topGenre: text('top_genre'),
  totalMinutes: integer('total_minutes').notNull().default(0),
}, (table) => ({
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  pk: primaryKey({ columns: [table.userId, table.date] }),
}))

export type DailyStat = typeof dailyStats.$inferSelect
export type NewDailyStat = typeof dailyStats.$inferInsert
