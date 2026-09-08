import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, ephemeralCV2, error, success } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('clearqueue')
    .setDescription('Clear the queue'),
  aliases: ['cq', 'clear'],
  category: 'music',
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const player = client.music.players.get(interaction.guildId!);
    if (!player) return interaction.reply(ephemeralCV2(error('Nothing playing.')) as any);

    player.queue.clear();
    await interaction.reply(cv2(success('Queue cleared.')) as any);
  }
};
