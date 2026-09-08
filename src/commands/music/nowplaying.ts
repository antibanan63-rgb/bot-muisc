import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container, ephemeralCV2 } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Shows what is currently playing.'),
  aliases: ['np'],
  category: 'music',
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const player = client.music.players.get(interaction.guildId!);
    if (!player || !player.queue.current) {
      return interaction.reply(ephemeralCV2(container('Nothing playing.')) as any);
    }

    const current = player.queue.current;
    const pos = player.position;
    const dur = current.length || 0;

    const barLength = 20;
    const filled = Math.round((pos / dur) * barLength) || 0;
    const bar = '▬'.repeat(filled) + '🔘' + '▬'.repeat(Math.max(0, barLength - filled - 1));

        const formatTime = (ms: number) => {
        const sec = Math.floor((ms / 1000) % 60).toString().padStart(2, '0');
        const min = Math.floor((ms / (1000 * 60)) % 60).toString().padStart(2, '0');
        const hr = Math.floor(ms / (1000 * 60 * 60));
        return hr > 0 ? `${hr}:${min}:${sec}` : `${min}:${sec}`;
    };

    const content = `[**${current.title}**](${current.uri})\n\n\`${formatTime(pos)}\` ${bar} \`${formatTime(dur)}\``;
    await interaction.reply(cv2(container(content, { title: 'Now Playing' })) as any);
  }
};
