import * as arctic from 'arctic'

import { spotifyConfig } from './config'

export const createSpotifyOAuth = (): arctic.Spotify =>
  new arctic.Spotify(
    spotifyConfig.clientId(),
    spotifyConfig.clientSecret(),
    spotifyConfig.redirectUri(),
  )
