import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, ChannelType } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, cv2 } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('ignore')
    .setDescription('Manage ignored channels.')
    .addSubcommand(s => s.setName('channel').setDescription('Add a channel to the ignore list').addChannelOption(o => o.setName('channel').setDescription('The channel').setRequired(false).addChannelTypes(ChannelType.GuildText)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a channel from the ignore list').addChannelOption(o => o.setName('channel').setDescription('The channel').setRequired(false).addChannelTypes(ChannelType.GuildText)))
    .addSubcommand(s => s.setName('list').setDescription('List all ignored channels'))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  category: 'ignore',
  aliases: ['ignore'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply(cv2(container('You must be a Server Administrator to use this.', { title: 'Missing Permissions', color: 'error' })) as any);
    }

    const sub = args[0]?.toLowerCase();
    const channelId = message.mentions.channels.first()?.id || args[1] || message.channel.id;

    if (sub === 'channel' || sub === 'add') {
      await this.addIgnore(client, message, channelId);
    } else if (sub === 'remove') {
      await this.removeIgnore(client, message, channelId);
    } else if (sub === 'list') {
      await this.listIgnore(client, message);
    } else {
      await message.reply(cv2(container('Invalid subcommand. Use `add`, `remove`, or `list`.', { title: 'Creo Ignore', color: 'error' })) as any);
    }
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const sub = interaction.options.getSubcommand();
    const channelId = interaction.options.getChannel('channel')?.id || interaction.channelId;

    if (sub === 'channel') {
      await this.addIgnore(client, interaction, channelId);
    } else if (sub === 'remove') {
      await this.removeIgnore(client, interaction, channelId);
    } else if (sub === 'list') {
      await this.listIgnore(client, interaction);
    }
  },

  async addIgnore(client: CreoClient, context: any, channelId: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    try {
      await client.db.ignoredChannel.upsert({
        where: { guildId_channelId: { guildId: context.guildId!, channelId } },
        update: {},
        create: { guildId: context.guildId!, channelId }
      });
      await reply(cv2(container(`Successfully added <#${channelId}> to ignored channels.`, { title: 'Creo Ignore', color: 'success' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`Failed to ignore channel: ${e.message}`, { title: 'Creo Ignore', color: 'error' })) as any);
    }
  },

  async removeIgnore(client: CreoClient, context: any, channelId: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    try {
      await client.db.ignoredChannel.delete({
        where: { guildId_channelId: { guildId: context.guildId!, channelId } }
      });
      await reply(cv2(container(`Successfully removed <#${channelId}> from ignored channels.`, { title: 'Creo Ignore', color: 'success' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`<#${channelId}> was not in the ignored channels list.`, { title: 'Creo Ignore', color: 'error' })) as any);
    }
  },

  async listIgnore(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    const channels = await client.db.ignoredChannel.findMany({ where: { guildId: context.guildId! } });
    if (channels.length === 0) {
      return reply(cv2(container('No channels are currently ignored in this server.', { title: 'Creo Ignore', color: 'default' })) as any);
    }

    const content = channels.map(c => `<#${c.channelId}> (\`${c.channelId}\`)`).join('\n');
    await reply(cv2(container(content, { title: 'Ignored Channels', color: 'default' })) as any);
  }
};
