import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, ephemeralCV2, error, success } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the player'),
  category: 'music',
  aliases: ['res', 'continue'],
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const player = client.music.players.get(interaction.guildId!);
    if (!player || !player.queue.current) return interaction.reply(ephemeralCV2(error('Nothing playing.')) as any);

    if (!player.paused) return interaction.reply(ephemeralCV2(error('Player is already playing.')) as any);
    player.pause(false);
    await interaction.reply(cv2(success('Resumed the player.')) as any);
  }
};
