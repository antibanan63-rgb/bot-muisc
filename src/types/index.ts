export enum PremiumTier {
  FREE = 0,
  BASIC = 1,
  PRO = 2,
  LIFETIME = 3
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  duration_ms: number;
  external_urls: { spotify: string };
  album?: { images: { url: string }[] };
}

export enum LoopMode {
  NONE = 0,
  TRACK = 1,
  QUEUE = 2
}
