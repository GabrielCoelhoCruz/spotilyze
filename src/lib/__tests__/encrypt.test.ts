import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { randomBytes } from 'node:crypto'

const TEST_KEY = randomBytes(32).toString('hex')

describe('encrypt/decrypt', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY
    process.env.SPOTIFY_CLIENT_ID = 'test-id'
    process.env.SPOTIFY_CLIENT_SECRET = 'test-secret'
    process.env.SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:3000/api/auth/callback'
  })

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY
  })

  it('round-trips plaintext', async () => {
    const { encrypt, decrypt } = await import('@/lib/crypto/encrypt')
    const plaintext = 'my-secret-token-value'
    const encrypted = encrypt(plaintext)
    expect(encrypted).not.toBe(plaintext)
    expect(decrypt(encrypted)).toBe(plaintext)
  })
})
