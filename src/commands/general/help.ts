import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2 } from '../../ui/containers';
import { buildHelpMenu } from '../../ui/helpMenu';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View the full help menu for FeroX Music.'),
  category: 'general',
  aliases: ['h', 'commands'],
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const userId = interaction.user.id;
    const c = buildHelpMenu('Home', client, userId);
    await interaction.reply(cv2(c) as any);
  }
};
