import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, ephemeralCV2, error, success } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the queue'),
  category: 'music',
  aliases: ['mix', 'sh'],
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const player = client.music.players.get(interaction.guildId!);
    if (!player) return interaction.reply(ephemeralCV2(error('Nothing playing.')) as any);

    player.queue.shuffle();
    await interaction.reply(cv2(success('Queue shuffled.')) as any);
  }
};
