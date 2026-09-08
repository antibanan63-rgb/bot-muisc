import { SlashCommandBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container, success } from '../../ui/containers';
import emojis from '../../utils/emojis';
import { getCustomIdPrefix } from '../premium/bnameplate';

export default {
  data: new SlashCommandBuilder()
    .setName('engine')
    .setDescription('Set your default search engine for music (Spotify, YouTube, SoundCloud, etc)'),
  category: 'music',

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction);
  },

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    await this.handleAction(client, message);
  },

  async handleAction(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const userId = isInteraction ? context.user.id : context.author.id;

    const userConfig = await client.db.userConfig.findUnique({ where: { userId } });
    const currentEngine = userConfig?.searchEngine || 'ytsearch';

    const engines: Record<string, { name: string, emoji: string }> = {
      'ytsearch': { name: 'YouTube', emoji: '<:emoji_39:1454496634770817054>' },
      'spsearch': { name: 'Spotify', emoji: '<:emoji_36:1454496625438228613>' },
      'scsearch': { name: 'SoundCloud', emoji: '<:soundcloud:1513805493192360077>' },
      'dzsearch': { name: 'Deezer', emoji: '<:Deezer:1515666887302840330>' },
      'jssearch': { name: 'JioSaavn', emoji: '<:jiosaavn:1513805340691529728>' }
    };

    const currentName = engines[currentEngine]?.name || currentEngine;

    const select = new StringSelectMenuBuilder()
      .setCustomId(`${getCustomIdPrefix(client)}:engine_select:${userId}`)
      .setPlaceholder(`Current: ${currentName}`);

    Object.entries(engines).forEach(([value, info]) => {
      select.addOptions({
        label: info.name,
        value: value,
        description: `Set ${info.name} as default search engine`,
        emoji: info.emoji
      });
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    const c = container(`**Select your preferred music search engine!**\nWhenever you type a song name, we'll search on this platform.\n\n${emojis.general.dot} **Current Engine:** \`${currentName}\``, { title: 'Music Engine' });
    c.addActionRowComponents(row as any);

    await reply(cv2(c) as any);
  }
};

