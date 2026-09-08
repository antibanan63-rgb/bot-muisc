import { KazagumoPlayer } from 'kazagumo';
import { CreoClient } from '../../bot';

export default {
  name: 'playerException',
  emitter: 'music',
  execute: async (...args: any[]) => {
    const client: CreoClient = args.pop();
    const player: KazagumoPlayer = args[0];
    const data: any = args[1];
    console.error(`[MUSIC EXCEPTION] Guild: ${player.guildId}`, data);
    const guildPlayer = client.guildPlayers.get(player.guildId);
    if (guildPlayer) {
      guildPlayer.updateActivity();
    }
  }
};
