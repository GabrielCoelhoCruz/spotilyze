import { z } from 'zod'

const ExtendedStreamingHistorySchema = z.object({
  email: z.string().optional(),
  library: z.object({
    music: z.object({
      songs: z.array(z.object({
        ts: z.string(),
        username: z.string().optional(),
        platform: z.string().optional(),
        ms_played: z.number(),
        conn_country: z.string().optional(),
        ip_addr_decrypted: z.string().optional(),
        user_agent_decrypted: z.string().optional(),
        master_metadata_track_name: z.string().nullable().optional(),
        master_metadata_album_artist_name: z.string().nullable().optional(),
        master_metadata_album_album_name: z.string().nullable().optional(),
        spotify_track_uri: z.string().nullable().optional(),
        episode_name: z.string().nullable().optional(),
        episode_show_name: z.string().nullable().optional(),
        spotify_episode_uri: z.string().nullable().optional(),
        reason_start: z.string().optional(),
        reason_end: z.string().optional(),
        shuffle: z.boolean().optional(),
        skipped: z.boolean().optional(),
        offline: z.boolean().optional(),
        offline_timestamp: z.number().optional(),
        incognito_mode: z.boolean().optional(),
      })),
    }),
  }),
})

export type ExtendedStreamingHistory = z.infer<typeof ExtendedStreamingHistorySchema>
export type ExtendedStreamingSong = ExtendedStreamingHistory['library']['music']['songs'][number]

export const parseExtendedStreamingHistory = (data: unknown): ExtendedStreamingHistory => {
  return ExtendedStreamingHistorySchema.parse(data)
}

export const extractTrackUri = (uri: string | null | undefined): string | null => {
  if (!uri) return null
  const match = uri.match(/spotify:track:([a-zA-Z0-9]+)/)
  return match ? match[1] : null
}
