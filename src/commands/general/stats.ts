import { SlashCommandBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container } from '../../ui/containers';
import emojis from '../../utils/emojis';


export default {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show detailed bot statistics.'),
  category: 'general',
  aliases: ['statistics', 'botstats'],
  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    await this.handleAction(client, message, true);
  },
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction, false);
  },
  async handleAction(client: CreoClient, context: any, isPrefix: boolean) {
    const authorId = isPrefix ? context.author.id : context.user.id;
    const botName = client.user?.username || 'Bot';
    const c = container(`${emojis.general.dot} Please select a category from the dropdown below to view statistics.`, { 
      title: `${emojis.general.stats_icon} ${botName} Stats`,
      footer: `${botName} • v1.0.0`
    });

    const customPrefix = 'CreoX';

    const select = new StringSelectMenuBuilder()
      .setCustomId(`${customPrefix}:stats_select:${authorId}`)
      .setPlaceholder('Select stats category...')
      .addOptions(
        { label: "General Stats", description: "Servers, Users, Shards", emoji: emojis.general.stats, value: "general" },
        { label: "Team Info", description: "Owner and Developer info", emoji: emojis.general.team, value: "team" },
        { label: "System Info", description: "DB, RAM, CPU", emoji: emojis.general.system, value: "system" },
        { label: "Ping", description: "Database & Websocket Latency", emoji: emojis.general.ping, value: "ping" },
        { label: "Music Node", description: "Lavalink Node status", emoji: emojis.general.music, value: "music" }
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    c.addActionRowComponents(row as any);

    if (isPrefix) {
      await context.reply(cv2(c) as any);
    } else {
      await context.reply(cv2(c) as any);
    }
  }
};

