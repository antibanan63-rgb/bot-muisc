import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, ephemeralCV2, error, success } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('Toggle autoplay mode'),
  aliases: ['ap'],
  category: 'music',
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const guildPlayer = client.guildPlayers.get(interaction.guildId!);
    if (!guildPlayer) return interaction.reply(ephemeralCV2(error('Nothing playing.')) as any);

    guildPlayer.autoplay = !guildPlayer.autoplay;
    await interaction.reply(cv2(success(`Autoplay is now **${guildPlayer.autoplay ? 'enabled' : 'disabled'}**.`)) as any);
  }
};
