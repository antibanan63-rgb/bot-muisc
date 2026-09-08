import { setVoiceChannelStatus } from '../../utils/voiceStatus';
import { KazagumoPlayer } from 'kazagumo';
import { CreoClient } from '../../bot';
import { updateBotPresence } from '../../utils/presence';

export default {
  name: 'playerEnd',
  emitter: 'music',
  execute: async (...args: any[]) => {
    const client: CreoClient = args.pop();
    const player: KazagumoPlayer = args[0];
    const guildPlayer = client.guildPlayers.get(player.guildId);
    if (guildPlayer) {
      guildPlayer.updateActivity();
    }
    updateBotPresence(client);
    if (player.voiceId) {
      await setVoiceChannelStatus(client, player.voiceId, "<a:music:1515753259636228166> Waiting for music...");
    }
  }
};

