import { SlashCommandBuilder, ChatInputCommandInteraction, User, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, success, error, ephemeralCV2, cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';
import { Logger } from '../../utils/logger';


export default {
  data: new SlashCommandBuilder()
    .setName('noprefix')
    .setDescription('Manage No-Prefix access for users')
    .addSubcommand(s => s.setName('add').setDescription('Grant no-prefix access').addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove no-prefix access').addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)))
    .addSubcommand(s => s.setName('status').setDescription('Check no-prefix access status').addUserOption(o => o.setName('user').setDescription('The user').setRequired(true))),
  category: 'owner',
  aliases: ['np', 'npmanage'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(message.author.id)) {
      return message.reply(cv2(error(`You are not authorized!`)) as any);
    }

    const action = args[0]?.toLowerCase();
    const targetMatch = args[1]?.match(/<@!?(\d+)>/) || [null, args[1]];
    const targetId = targetMatch[1];

    if (!action || !targetId) {
      const prefix = process.env.PREFIX || '$';
      return message.reply(cv2(error(`Usage: \`${prefix}np <add|remove|status> <@user>\``)) as any);
    }

    const user = await client.users.fetch(targetId).catch(() => null);
    if (!user) {
      return message.reply(cv2(error('Invalid user!')) as any);
    }

    await this.handleAction(client, message, action, user);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(interaction.user.id)) {
      return interaction.reply(ephemeralCV2(error('This command is restricted to the bot owner.')) as any);
    }

    const action = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user', true);

    await this.handleAction(client, interaction, action, user);
  },

  async handleAction(client: CreoClient, context: any, action: string, user: User) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    if (action === 'add') {
      const customPrefix = 'CreoX';
      const select = new StringSelectMenuBuilder()
        .setCustomId(`${customPrefix}:np_duration:${user.id}`)
        .setPlaceholder('Choose access duration...')
        .addOptions(
          { label: '1 Week', value: '7' },
          { label: '1 Month', value: '30' },
          { label: '3 Months', value: '90' },
          { label: '6 Months', value: '180' },
          { label: 'Lifetime', value: '0' }
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
      const c = container(`Select the duration for **${user.tag}**'s no-prefix access:`, { title: 'Creo Noprefix' });
      c.addActionRowComponents(row as any);

      await reply(isInteraction ? { ...ephemeralCV2(c), components: [row] } as any : cv2(c) as any);
    } else if (action === 'remove') {
      const existing = await client.db.noPrefixUser.findUnique({ where: { userId: user.id } });
      if (existing) {
        await client.db.noPrefixUser.delete({ where: { userId: user.id } });
        Logger.logNP('Removed', user, 'User was removed from the No-Prefix list.');
        await reply(cv2(container(`Successfully removed **${user.tag}** from no-prefix list.`, { title: 'Creo Owner', color: 'success' })) as any);
      } else {
        await reply(cv2(container(`**${user.tag}** was not in the no-prefix list.`, { title: 'Creo Owner', color: 'error' })) as any);
      }
    } else if (action === 'status') {
      const data = await client.db.noPrefixUser.findUnique({ where: { userId: user.id } });
      if (data) {
        const expiry = data.expiresAt ? `<t:${Math.floor(data.expiresAt.getTime() / 1000)}:R>` : 'Lifetime';
        await reply(cv2(container(`**User:** <@${user.id}>\n**Status:** Active\n**Expiry:** ${expiry}`, { title: 'Creo No-Prefix Status', color: 'success' })) as any);
      } else {
        await reply(cv2(container(`**${user.tag}** does not have no-prefix access.`, { title: 'Creo No-Prefix Status', color: 'error' })) as any);
      }
    } else {
      await reply(cv2(container('Invalid action.', { title: 'Creo Owner', color: 'error' })) as any);
    }
  }
};

