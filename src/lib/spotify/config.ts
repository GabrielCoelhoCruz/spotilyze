const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const spotifyConfig = {
  clientId: (): string => requireEnv('SPOTIFY_CLIENT_ID'),
  clientSecret: (): string => requireEnv('SPOTIFY_CLIENT_SECRET'),
  redirectUri: (): string => requireEnv('SPOTIFY_REDIRECT_URI'),
  encryptionKey: (): string => requireEnv('ENCRYPTION_KEY'),
}

export const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-read-recently-played',
  'user-top-read',
] as const
