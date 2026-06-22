import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

import { spotifyConfig } from '@/lib/spotify/config'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

const getKeyBuffer = (): Buffer => {
  const key = spotifyConfig.encryptionKey()
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, 'hex')
  }
  const decoded = Buffer.from(key, 'base64')
  if (decoded.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars or 44 base64 chars)')
  }
  return decoded
}

export const encrypt = (plaintext: string): string => {
  const key = getKeyBuffer()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv, authTag, encrypted].map((part) => part.toString('base64')).join(':')
}

export const decrypt = (payload: string): string => {
  const [ivB64, tagB64, dataB64] = payload.split(':')
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid encrypted payload format')
  }

  const key = getKeyBuffer()
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(tagB64, 'base64')
  const data = Buffer.from(dataB64, 'base64')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}
