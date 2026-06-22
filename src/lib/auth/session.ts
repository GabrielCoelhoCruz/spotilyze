import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { users } from '@/db/schema'
import { getSessionUserId } from '@/lib/crypto/state'

export const getCurrentUser = async () => {
  const userId = await getSessionUserId()
  if (!userId) {
    return null
  }

  const rows = await db.select().from(users).where(eq(users.id, userId))
  return rows[0] ?? null
}
