# FeroX Music

A Discord music bot I built because every "free" music bot out there either sounds terrible, dies every two weeks from a Discord API change, or locks basic loop/queue features behind a paywall. This one's mine, it's fast, and it doesn't do that.

Built on Discord.js v14 + Kazagumo/Shoukaku (Lavalink) for playback, Prisma + SQLite for storage, and the new Components V2 UI so the player panel actually looks like something from 2024 and not a Discord.js tutorial from 2019.

Maintained under **FeroX Devs**.

## What it actually does

- Plays from YouTube, Spotify, SoundCloud, Deezer and JioSaavn — pick your default engine per-user with `/engine`, no more typing "sc:" or "sp:" before every query
- A proper interactive player panel with buttons for pause, skip, rewind/forward, loop, shuffle, autoplay and liking a track — no reactions, no dead buttons
- Autoplay that actually queues something relevant when your queue runs dry, instead of just leaving the VC
- Audio filters (bass boost, nightcore, vaporwave, 8D, karaoke, and a few more) you can stack from a dropdown
- Playlists and liked songs saved per-user, so your queue isn't wiped the second the bot restarts
- Both slash commands and prefix commands work side by side, including a no-prefix mode for whoever you decide deserves it
- 24/7 mode so the bot stays connected in a voice channel instead of leaving after every song
- Per-server config: custom prefix, ignored channels, auto-reactions, auto-responses
- A small premium tier system (custom bot bio/avatar/banner/nameplate per server) if you want to monetize it, or just rip that out if you don't care

## Before you start

You'll need:

- Node.js 18+
- A running Lavalink server (v4). Kazagumo talks to it, the bot doesn't play audio on its own
- A Discord bot token and its client ID
- SQLite is the default DB, no separate database server needed, but you can swap the Prisma datasource if you want Postgres/MySQL later

## Setting it up

Clone it, install dependencies:

```bash
git clone https://github.com/RexyExo/FeroX-Music-.git
cd ferox-music-
npm install
```

Copy `example.env` to `.env` and fill in your actual values:

```env
BOT_TOKEN=your bot token
CLIENT_ID=your bot's client id
DATABASE_URL=file:./creo.db

LAVALINK_URL=localhost:2333
LAVALINK_AUTH=youshallnotpass
LAVALINK_NAME=MainNode

PREFIX=.
OWNER_ID=your discord user id, comma separated if there's more than one owner
```

If you're using Spotify search, also drop in `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from the Spotify developer dashboard. Don't rely on this being optional forever, get your own keys.

Push the Prisma schema to generate your local database:

```bash
npx prisma generate
npx prisma db push
```

Then run it:

```bash
npm run dev     # ts-node with nodemon, restarts on file changes
npm start        # plain ts-node, for production-ish usage
```

The bot uses Discord's `ShardingManager`, so `src/index.ts` is the actual entry point that spawns shard processes, not `src/bot.ts` directly.

## Commands

**Music**
`play`, `search`, `pause`, `resume`, `skip`, `stop`, `disconnect`, `join`, `queue`, `clearqueue`, `nowplaying`, `loop`, `shuffle`, `seek`, `replay`, `volume`, `autoplay`, `filters`, `engine`, `liked`, `playlist`

**General**
`help`, `info`, `ping`, `stats`, `invite`, `support`, `vote`, `avatar`, `banner`, `profile`

**Fun**
`hug`, `kiss`, `pat`, `slap`, `ship`

**Server config** (admin only)
`ignore`, `react`, `respond`

**Premium**
`247`, `bprefix`, `bbio`, `bpfp`, `bbanner`, `bnameplate`

**Owner only**
`admin`, `premium`, `noprefix`, `gnameplate`, `reload`, `restart`

Full list with live descriptions is always available in-app via `/help`.

## Project layout

```
src/
  bot.ts              client setup, Kazagumo init, boot sequence
  index.ts             sharding manager entry point
  commands/            one file per command, grouped by category
  events/               discord.js + kazagumo event listeners
  events/music/        track start/end/empty/exception handlers
  handlers/             loads commands/events, routes buttons & selects
  managers/            per-guild player state, filters
  ui/                   Components V2 builders (player panel, containers, help menu)
  utils/                 misc helpers: emojis, formatting, voice status, lyrics, etc.
prisma/
  schema.prisma         all the DB models (guild config, playlists, premium, etc.)
```

If you're adding a command, drop a file in the right `commands/<category>/` folder with a `data` (SlashCommandBuilder) and `execute` export, that's it, the command handler picks it up automatically on boot. Add `prefixExecute` too if you want it to also work as a text command.


## License & credit

Built and maintained by FeroX Devs. Do whatever you want with it, just don't strip the credit and resell it as your own bot without at least asking first.
