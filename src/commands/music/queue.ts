import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container, ephemeralCV2 } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Shows the current music queue.'),
  aliases: ['q'],
  category: 'music',
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const player = client.music.players.get(interaction.guildId!);
    if (!player) return interaction.reply(ephemeralCV2(container('No music is currently playing in this server.', { title: 'Error' })) as any);

    if (player.queue.length === 0 && !player.queue.current) {
      return interaction.reply(cv2(container('The queue is empty.')) as any);
    }

    const current = player.queue.current;
    let content = `**Now Playing**\n[${current?.title}](${current?.uri})\n\n**Up Next**\n`;

    const tracks = player.queue.slice(0, 10);
    if (tracks.length === 0) content += 'No more tracks in queue.';
    else {
      tracks.forEach((track: any, index: number) => {
        content += `**${index + 1}.** [${track.title}](${track.uri})\n`;
      });
    }

    if (player.queue.length > 10) content += `\n*...and ${player.queue.length - 10} more tracks.*`;

    await interaction.reply(cv2(container(content, { title: `Queue for ${interaction.guild?.name}` })) as any);
  }
};
