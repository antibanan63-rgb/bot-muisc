import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container, ephemeralCV2, error, success } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seek to a specific time')
    .addIntegerOption(o => o.setName('seconds').setDescription('Time in seconds').setRequired(true)),
  category: 'music',
  aliases: ['forward', 'jump'],
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const player = client.music.players.get(interaction.guildId!);
    if (!player || !player.queue.current) return interaction.reply(ephemeralCV2(error('Nothing playing.')) as any);

    const seconds = interaction.options.getInteger('seconds', true);
    player.seek(seconds * 1000);
    await interaction.reply(cv2(success(`Seeked to **${seconds}s**`)) as any);
  }
};
