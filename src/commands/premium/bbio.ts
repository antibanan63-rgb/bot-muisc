import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, ephemeralCV2, cv2 } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('bbio')
    .setDescription('Changes the bot\'s bio in this server.')
    .addStringOption(o => o.setName('text').setDescription('Bio text').setRequired(true))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  category: 'premium',
  aliases: ['bbio'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== message.guild?.ownerId) {
      return message.reply(cv2(container('You must be a Server Administrator or Owner to use this.', { title: 'Missing Permissions', color: 'error' })) as any);
    }

    const bio = args.join(' ');
    await this.handleAction(client, message, bio || undefined);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const bio = interaction.options.getString('text', true);
    await this.handleAction(client, interaction, bio);
  },

  async handleAction(client: CreoClient, context: any, bio?: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    const isPremium = await client.db.premiumUser.findUnique({ where: { userId: authorId } });
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!isPremium && !ownerIds.includes(authorId)) {
      return reply(cv2(container('This command is exclusively for Premium Users.', { title: 'Creo Premium', color: 'error' })) as any);
    }

    if (!bio) {
      return reply(cv2(container('Please provide a bio text or use `none` to reset.', { title: 'Creo Customization', color: 'error' })) as any);
    }

    const newBio = bio.toLowerCase() === 'none' ? null : bio;

    try {
      await client.db.guildConfig.upsert({
        where: { guildId: context.guildId! },
        update: { bio: newBio },
        create: { guildId: context.guildId!, bio: newBio }
      });

      const status = newBio === null ? 'reset' : 'updated';
      await reply(cv2(container(`Successfully ${status} the bot's server-specific bio!`, { title: 'Creo Customization', color: 'success' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`Failed to update bio: \`${e.message || e}\``, { title: 'Creo Customization', color: 'error' })) as any);
    }
  }
};


