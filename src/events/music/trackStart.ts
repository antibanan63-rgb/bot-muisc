import { setVoiceChannelStatus } from '../../utils/voiceStatus';
import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import { CreoClient } from '../../bot';
import { GuildPlayer } from '../../managers/PlayerManager';
import { buildPlayerUI } from '../../ui/playerEmbed';
import { MessageFlags, TextChannel } from 'discord.js';
import { cv2 } from '../../ui/containers';
import { updateBotPresence } from '../../utils/presence';
import emojis from '../../utils/emojis';

export default {
  name: 'playerStart',
  emitter: 'music',
  execute: async (...args: any[]) => {
    const client: CreoClient = args.pop();
    const player: KazagumoPlayer = args[0];
    const track: KazagumoTrack = args[1];
    let guildPlayer = client.guildPlayers.get(player.guildId);
    if (!guildPlayer) {
      guildPlayer = new GuildPlayer(player);
      client.guildPlayers.set(player.guildId, guildPlayer);
    }

    guildPlayer.updateActivity();
    updateBotPresence(client);

    await guildPlayer.resendPanel(client);
    if (player.voiceId) {
      const statusText = `<a:Playing:1513451285880246322> Listening to: ${track.title}`;
      await setVoiceChannelStatus(client, player.voiceId, statusText);
    }
  }
};

