import { SlashCommandBuilder, ChatInputCommandInteraction, User, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CreoClient } from '../../bot';
import { success, error, ephemeralCV2, cv2, container } from '../../ui/containers';
import { Logger } from '../../utils/logger';
import ms from 'ms';

export default {
  data: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Manage Premium access for users')
    .addSubcommand(s => s.setName('add').setDescription('Grant premium access')
      .addUserOption(o => o.setName('user').setDescription('The user').setRequired(true))
      .addStringOption(o => o.setName('timelimit').setDescription('Optional limit (e.g. 30d, 1y)').setRequired(false)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove premium access')
      .addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List premium users'))
    .addSubcommand(s => s.setName('status').setDescription('Check premium access status')
      .addUserOption(o => o.setName('user').setDescription('The user').setRequired(false))),
  category: 'owner',
  aliases: ['premium'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(message.author.id)) return;

    const action = args[0]?.toLowerCase();
    const targetMatch = args[1]?.match(/<@!?(\d+)>/) || [null, args[1]];
    const targetId = targetMatch[1];
    const timelimit = args[2] || null;

    if (!action) {
      const prefix = process.env.PREFIX || '$';
      return message.reply(cv2(error(`Usage: \`${prefix}premium <add|remove|list|status> [@user] [timelimit]\``)) as any);
    }

    let user: User | null = null;
    if (targetId) user = await client.users.fetch(targetId).catch(() => null);

    if (action === 'status' && !user) user = message.author;

    if (['add', 'remove'].includes(action) && !user) {
      return message.reply(cv2(error('Invalid user!')) as any);
    }

    await this.handleAction(client, message, action, user, timelimit);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(interaction.user.id)) {
      return interaction.reply(ephemeralCV2(error('This command is restricted to the bot owner.')) as any);
    }

    const action = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user') || interaction.user;
    const timelimit = interaction.options.getString('timelimit');

    await this.handleAction(client, interaction, action, user, timelimit);
  },

  async handleAction(client: CreoClient, context: any, action: string, user: User | null, timelimit: string | null = null) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    if (action === 'add' && user) {
      if (timelimit) {
        const durationMs = ms(timelimit as any);
        if (!durationMs) {
          return reply(cv2(error('Invalid time format. Please use formats like 30d, 1y, 6m.')) as any);
        }
        
        const expiresAt = new Date(Date.now() + durationMs);
        await client.db.premiumUser.upsert({
          where: { userId: user.id },
          update: { expiresAt },
          create: { userId: user.id, expiresAt }
        });
        
        const timeStr = `until <t:${Math.floor(expiresAt.getTime() / 1000)}:f>`;
        Logger.logPremium('Added', user, `User was granted premium access ${timeStr}.`);
        await reply(cv2(container(`Successfully added <@${user.id}> to premium list ${timeStr}.`, { title: 'Creo Premium', color: 'success' })) as any);
      } else {
        const customPrefix = 'CreoX';
        const select = new StringSelectMenuBuilder()
          .setCustomId(`${customPrefix}:premium_duration:${user.id}`)
          .setPlaceholder('Choose access duration...')
          .addOptions(
            { label: '1 Week', value: '7' },
            { label: '1 Month', value: '30' },
            { label: '6 Months', value: '180' },
            { label: '1 Year', value: '365' },
            { label: '3 Years', value: '1095' },
            { label: 'Lifetime', value: '0' }
          );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
        const c = container(`Select the duration for <@${user.id}>'s premium access:`, { title: 'Creo Premium' });
        c.addActionRowComponents(row as any);

        await reply(isInteraction ? { ...ephemeralCV2(c), components: [row] } as any : cv2(c) as any);
      }
    } else if (action === 'remove' && user) {
      const existing = await client.db.premiumUser.findUnique({ where: { userId: user.id } });
      if (existing) {
        await client.db.premiumUser.delete({ where: { userId: user.id } });
        Logger.logPremium('Removed', user, 'User had their premium access revoked.');
        await reply(cv2(container(`Successfully removed <@${user.id}> from premium list.`, { title: 'Creo Premium', color: 'success' })) as any);
      } else {
        await reply(cv2(container(`**${user.tag}** was not in the premium list.`, { title: 'Creo Premium', color: 'error' })) as any);
      }
    } else if (action === 'list') {
      const data = await client.db.premiumUser.findMany();
      if (data.length > 0) {
        const usersList = data.map(d => `<@${d.userId}> - ` + (d.expiresAt ? `<t:${Math.floor(d.expiresAt.getTime() / 1000)}:R>` : 'Lifetime')).join('\n');
        await reply(cv2(container(usersList, { title: 'Creo Premium Users', color: 'success' })) as any);
      } else {
        await reply(cv2(container(`No premium users found.`, { title: 'Creo Premium Users', color: 'success' })) as any);
      }
    } else if (action === 'status') {
      const targetUser = user || context.author || context.user;
      const data = await client.db.premiumUser.findUnique({ where: { userId: targetUser.id } });
      if (data) {
        const expiry = data.expiresAt ? `<t:${Math.floor(data.expiresAt.getTime() / 1000)}:R>` : 'Lifetime';
        await reply(cv2(container(`**User:** <@${targetUser.id}>\n**Status:** Premium Active 💎\n**Expiry:** ${expiry}`, { title: 'Creo Premium Status', color: 'success' })) as any);
      } else {
        await reply(cv2(container(`**User:** <@${targetUser.id}>\n**Status:** Not Premium ❌`, { title: 'Creo Premium Status', color: 'error' })) as any);
      }
    } else {
      await reply(cv2(container('Invalid action.', { title: 'Creo Premium', color: 'error' })) as any);
    }
  }
};

