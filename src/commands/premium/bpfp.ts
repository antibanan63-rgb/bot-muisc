import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, ephemeralCV2, cv2 } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('bpfp')
    .setDescription('Changes the bot\'s avatar in this server.')
    .addStringOption(o => o.setName('url').setDescription('Image URL').setRequired(false))
    .addAttachmentOption(o => o.setName('image').setDescription('Image file').setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  category: 'premium',
  aliases: ['bpfp'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== message.guild?.ownerId) {
      return message.reply(cv2(container('You must be a Server Administrator or Owner to use this.', { title: 'Missing Permissions', color: 'error' })) as any);
    }

    const url = args[0] || message.attachments.first()?.url;
    await this.handleAction(client, message, url);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const url = interaction.options.getString('url') || interaction.options.getAttachment('image')?.url;
    await this.handleAction(client, interaction, url || undefined);
  },

  async handleAction(client: CreoClient, context: any, url?: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    const isPremium = await client.db.premiumUser.findUnique({ where: { userId: authorId } });
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!isPremium && !ownerIds.includes(authorId)) {
      return reply(cv2(container('This command is exclusively for Premium Users.', { title: 'Creo Premium', color: 'error' })) as any);
    }

    if (!url) {
      return reply(cv2(container('Please provide a URL or attach an image.', { title: 'Creo Customization', color: 'error' })) as any);
    }

    const targetUrl = url.toLowerCase() === 'none' ? null : url;

    try {
      if (targetUrl) {

                const res = await fetch(targetUrl).catch(() => null);
        if (!res || !res.ok) {
          return reply(cv2(container('Failed to download image. Please check the URL.', { title: 'Creo Customization', color: 'error' })) as any);
        }
        const buffer = await res.arrayBuffer();
        const mimeType = res.headers.get('content-type') || 'image/png';
        const base64 = `data:${mimeType};base64,${Buffer.from(buffer).toString('base64')}`;


                await client.rest.patch(`/guilds/${context.guildId}/members/@me` as any, {
          body: { avatar: base64 }
        }).catch(() => null);
      } else {

                await client.rest.patch(`/guilds/${context.guildId}/members/@me` as any, {
          body: { avatar: null }
        }).catch(() => null);
      }

      await client.db.guildConfig.upsert({
        where: { guildId: context.guildId! },
        update: { avatarUrl: targetUrl },
        create: { guildId: context.guildId!, avatarUrl: targetUrl }
      });

      const status = targetUrl === null ? 'reset' : 'updated';
      await reply(cv2(container(`Successfully ${status} the bot's server-specific avatar!`, { title: 'Creo Customization', color: 'success' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`Failed to update avatar: \`${e.message || e}\``, { title: 'Creo Customization', color: 'error' })) as any);
    }
  }
};


