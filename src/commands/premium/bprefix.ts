import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, ephemeralCV2, cv2 } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('bprefix')
    .setDescription('Changes the bot\'s prefix for this server.')
    .addStringOption(o => o.setName('prefix').setDescription('New prefix').setRequired(true))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  category: 'premium',
  aliases: ['bprefix'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== message.guild?.ownerId) {
      return message.reply(cv2(container('You must be a Server Administrator or Owner to use this.', { title: 'Missing Permissions', color: 'error' })) as any);
    }

    const prefix = args[0];
    await this.handleAction(client, message, prefix);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const prefix = interaction.options.getString('prefix', true);
    await this.handleAction(client, interaction, prefix);
  },

  async handleAction(client: CreoClient, context: any, newPrefix?: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    const isPremium = await client.db.premiumUser.findUnique({ where: { userId: authorId } });
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!isPremium && !ownerIds.includes(authorId)) {
      return reply(cv2(container('This command is exclusively for Premium Users.', { title: 'Creo Premium', color: 'error' })) as any);
    }

    if (!newPrefix) {
      return reply(cv2(container('Please provide a new prefix.', { title: 'Creo Customization', color: 'error' })) as any);
    }

    if (newPrefix.length > 5) {
      return reply(cv2(container('Prefix must be 5 characters or less.', { title: 'Creo Customization', color: 'error' })) as any);
    }

    try {
      await client.db.guildConfig.upsert({
        where: { guildId: context.guildId! },
        update: { prefix: newPrefix },
        create: { guildId: context.guildId!, prefix: newPrefix }
      });

      await reply(cv2(container(`Successfully changed the bot's prefix to \`${newPrefix}\` for this server!`, { title: 'Creo Customization', color: 'success' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`Failed to update prefix: \`${e.message || e}\``, { title: 'Creo Customization', color: 'error' })) as any);
    }
  }
};


