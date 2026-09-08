/** NOTE: getLyrics is currently unlinked from player UI controls. */
import Genius from 'genius-lyrics';

const GENIUS_TOKEN = process.env.GENIUS_TOKEN || '';
const client = new Genius.Client(GENIUS_TOKEN);

export async function getLyrics(title: string, artist: string): Promise<string | null> {
  if (!GENIUS_TOKEN) return null;


      const cleanTitle = title
    .replace(/\[.*\]/g, '')
    .replace(/\(.*\)/g, '')
    .replace(/official( video| audio)?/gi, '')
    .trim();

  try {
    const searches = await client.songs.search(`${cleanTitle} ${artist}`);
    if (searches.length === 0) return null;
    const song = searches[0];
    const lyrics = await song.lyrics();
    return lyrics;
  } catch (error) {
    return null;
  }
}
