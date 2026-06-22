import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  spotifyId: text('spotify_id').notNull().unique(),
  displayName: text('display_name'),
  country: text('country'),
  product: text('product'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
