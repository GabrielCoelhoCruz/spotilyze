import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const tracks = sqliteTable('tracks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  artistIds: text('artist_ids', { mode: 'json' }).notNull().$type<string[]>(),
  albumId: text('album_id'),
  durationMs: integer('duration_ms'),
  popularity: integer('popularity'),
  explicit: integer('explicit', { mode: 'boolean' }),
  previewUrl: text('preview_url'),
  imageUrl: text('image_url'),
  externalUrls: text('external_urls', { mode: 'json' }).$type<Record<string, string>>(),
})

export type Track = typeof tracks.$inferSelect
export type NewTrack = typeof tracks.$inferInsert
