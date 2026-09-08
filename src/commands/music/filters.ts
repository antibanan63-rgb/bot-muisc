import { SlashCommandBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, ephemeralCV2, cv2 } from '../../ui/containers';
import { GuildMember } from 'discord.js';
import emojis from '../../utils/emojis';
import { getCustomIdPrefix } from '../premium/bnameplate';

export default {
  data: new SlashCommandBuilder()
    .setName('filters')
    .setDescription('Apply audio filters to the currently playing song'),
  category: 'music',
  aliases: ['filter', 'effects', 'eq'],

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction);
  },

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    await this.handleAction(client, message);
  },

  async handleAction(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const member = isInteraction ? context.member as GuildMember : context.member;
    const voiceChannel = member?.voice.channel;

    if (!voiceChannel) {
      return reply(ephemeralCV2(error('You need to be in a voice channel to use filters!')) as any);
    }

    const player = client.music.players.get(context.guildId!);
    if (!player || !player.queue.current) {
      return reply(ephemeralCV2(error('There is no music playing right now.')) as any);
    }

    const availableFilters = [
      { id: 'clear', name: 'Clear Filters' },
      { id: 'bass', name: 'Bass Boost' },
      { id: 'treble', name: 'Treble Boost' },
      { id: 'nightcore', name: 'Nightcore' },
      { id: 'vaporwave', name: 'Vaporwave' },
      { id: '8d', name: '8D Audio' },
      { id: 'karaoke', name: 'Karaoke' },
      { id: 'soft', name: 'Soft' },
      { id: 'tremolo', name: 'Tremolo' },
      { id: 'vibrato', name: 'Vibrato' },
      { id: 'distortion', name: 'Distortion' }
    ];

    const select = new StringSelectMenuBuilder()
      .setCustomId(`${getCustomIdPrefix(client)}:filter_select`)
      .setPlaceholder('Select an audio filter to apply...');

    availableFilters.forEach(filter => {
      select.addOptions({
        label: filter.name,
        value: filter.id
      });
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    
    const c = container(`**Audio Filters Menu**\nSelect a filter from the dropdown below to apply it to the music. You can stack some filters or clear them completely.\n\n${emojis.general.dot} **Note:** It might take a few seconds for the filter to apply.`, { title: 'Music Filters' });
    c.addActionRowComponents(row as any);

    await reply(cv2(c) as any);
  }
};

