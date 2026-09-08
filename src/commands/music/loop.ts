import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, ephemeralCV2, error, success } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggle loop mode')
    .addStringOption(o => o.setName('mode').setDescription('Mode').setRequired(true).addChoices({name:'Track',value:'track'},{name:'Queue',value:'queue'},{name:'Off',value:'none'})),
  category: 'music',
  aliases: ['repeat', 'l'],
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const player = client.music.players.get(interaction.guildId!);
    if (!player) return interaction.reply(ephemeralCV2(error('Nothing playing.')) as any);

    const mode = interaction.options.getString('mode', true);
    if (!mode) return interaction.reply(ephemeralCV2(error('Please provide a mode: track, queue, none.')) as any);
    player.setLoop(mode as any);
    await interaction.reply(cv2(success(`Loop mode set to **${mode}**.`)) as any);
  }
};
