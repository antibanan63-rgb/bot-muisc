import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';

let spotify: SpotifyApi | null = null;

if (SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET) {
  try {
    spotify = SpotifyApi.withClientCredentials(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
  } catch (err) {
    console.error('[SPOTIFY] Failed to initialize client');
  }
}

export async function resolveSpotifyTrack(url: string): Promise<string | null> {
  if (!spotify) return null;
  try {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const track = await spotify.tracks.get(match[1]);
    return `${track.name} ${track.artists.map((a: any) => a.name).join(' ')}`;
  } catch (e) {
    return null;
  }
}

export async function resolveSpotifyPlaylist(url: string): Promise<string[] | null> {
  if (!spotify) return null;
  try {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const playlist = await spotify.playlists.getPlaylistItems(match[1]);
    return playlist.items.map((i: any) => `${i.track.name} ${i.track.artists.map((a: any) => a.name).join(' ')}`);
  } catch (e) {
    return null;
  }
}
