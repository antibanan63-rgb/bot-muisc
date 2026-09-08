import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, ephemeralCV2, error, success } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the player'),
  category: 'music',
  aliases: ['hold'],
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const player = client.music.players.get(interaction.guildId!);
    if (!player || !player.queue.current) return interaction.reply(ephemeralCV2(error('Nothing playing.')) as any);

    if (player.paused) return interaction.reply(ephemeralCV2(error('Player is already paused.')) as any);
    player.pause(true);
    await interaction.reply(cv2(success('Paused the player.')) as any);
  }
};
