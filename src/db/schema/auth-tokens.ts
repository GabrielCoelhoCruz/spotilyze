import { sqliteTable, text, integer, foreignKey } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const authTokens = sqliteTable('auth_tokens', {
  userId: text('user_id').primaryKey(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  scope: text('scope').notNull(),
}, (table) => ({
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
}))

export type AuthToken = typeof authTokens.$inferSelect
export type NewAuthToken = typeof authTokens.$inferInsert
