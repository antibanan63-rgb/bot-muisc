import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, ephemeralCV2, error, success } from '../../ui/containers';


export default {
  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect from voice channel'),
  aliases: ['dc', 'leave'],
  category: 'music',
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const player = client.music.players.get(interaction.guildId!);
    if (!player) return interaction.reply(ephemeralCV2(error('I am not in a voice channel.')) as any);

    try {
      await player.destroy();
    } catch (e) {}
    client.guildPlayers.delete(interaction.guildId!);
    await interaction.reply(cv2(success('Disconnected from voice channel.')) as any);
  }
};
