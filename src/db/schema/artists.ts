import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const artists = sqliteTable('artists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  genres: text('genres', { mode: 'json' }).notNull().$type<string[]>(),
  popularity: integer('popularity'),
  followers: integer('followers'),
  imageUrl: text('image_url'),
})

export type Artist = typeof artists.$inferSelect
export type NewArtist = typeof artists.$inferInsert
