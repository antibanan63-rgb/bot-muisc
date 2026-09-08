import { ActivityType } from 'discord.js';
import { CreoClient } from '../bot';

export function updateBotPresence(client: CreoClient) {
  const activePlayers = Array.from(client.music.players.values()).filter(p => p.playing && p.queue.current).length;
  const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0);
  const latency = Math.round(client.ws.ping) || 0;
  const prefix = process.env.PREFIX || '$';

  client.user?.setPresence({
    activities: [{
      name: `Latency: ${latency}ms`,
      type: ActivityType.Watching,
      state: `Enjoying music on ${activePlayers} server(s) & Prefix: ${prefix}`
    }],
    status: 'online',
    afk: false
  });
}
