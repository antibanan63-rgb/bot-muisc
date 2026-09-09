import { setVoiceChannelStatus } from '../../utils/voiceStatus';
import { KazagumoPlayer } from 'kazagumo';
import { CreoClient } from '../../bot';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { container, cv2 } from '../../ui/containers';
import { updateBotPresence } from '../../utils/presence';
import emojis from '../../utils/emojis';

export default {
  name: 'playerEmpty',
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

    if (guildPlayer && guildPlayer.autoplay && !guildPlayer.isStopped) {
      const previousTrack = player.queue.previous[0];
      if (previousTrack) {
        const query = previousTrack.author && previousTrack.author !== 'Unknown' 
          ? previousTrack.author 
          : previousTrack.title;

                const res = await client.music.search(query, { requester: client.user });
        if (res.tracks.length > 0) {
          const previousUris = player.queue.previous.map(t => t.uri);
          const newTracks = res.tracks.filter(t => !previousUris.includes(t.uri));

                    if (newTracks.length > 0) {
            const randomTrack = newTracks[Math.floor(Math.random() * Math.min(newTracks.length, 5))];
            player.queue.add(randomTrack);
            if (!player.playing && !player.paused) player.play();
            return;
          }
        }
      }
    }

    const botId = client.user!.id;
    const c = container("Queue have been ended");
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("Support").setURL("https://discord.gg/nJRBeUxrv").setStyle(ButtonStyle.Link)
    );
    c.addActionRowComponents(row as any);

    if (player.textId) {
      const channel = client.channels.cache.get(player.textId) as TextChannel;
      if (channel) {
        await channel.send(cv2(c) as any).catch(() => {});
      }
    }
  }
};

