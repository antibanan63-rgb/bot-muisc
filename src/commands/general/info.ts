import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextDisplayBuilder, SeparatorBuilder, ContainerBuilder } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';


export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('View information about the Creo bot.'),
  category: 'general',
  aliases: ['info'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    await this.handleAction(client, message);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction);
  },

  async handleAction(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    const servers = client.guilds.cache.size;
    const users = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

    let prefix = '$';
    if (context.guildId) {
      const gConf = await client.db.guildConfig.findUnique({ where: { guildId: context.guildId } });
      if (gConf && gConf.prefix) prefix = gConf.prefix;
    }

    const c = new ContainerBuilder();

    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emojis.general.music} Creo\n### *A Premium Experience Made By FeroX Devs*\n\n> ${emojis.general.settings} **Bot Settings**\n> ${emojis.general.dot} **Prefix:** \`${prefix}\`\n> ${emojis.general.dot} **Command Mode:** \`Hybrid (Slash & Prefix)\`\n\n> ${emojis.general.stats_icon} **Bot Statistics**\n> ${emojis.general.dot} **Servers:** ${servers}\n> ${emojis.general.dot} **Users:** ${users.toLocaleString()}\n\n-# Use \`${prefix}help\` or type \`/\` to explore commands!`)
    );

    c.addSeparatorComponents(new SeparatorBuilder());

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("Support Server").setURL("https://discord.gg/Vx43JXddFD").setStyle(ButtonStyle.Link),
      new ButtonBuilder().setLabel("Invite Creo").setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user!.id}&permissions=8&scope=bot%20applications.commands`).setStyle(ButtonStyle.Link)
    );

    c.addActionRowComponents(row as any);

    await reply(cv2(c) as any);
  }
};
