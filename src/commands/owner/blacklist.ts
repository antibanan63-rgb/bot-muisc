import { SlashCommandBuilder, ChatInputCommandInteraction, User } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, success, error, ephemeralCV2, cv2 } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage blacklisted users')
    .addSubcommand(s => s.setName('add').setDescription('Add a user to the blacklist').addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a user from the blacklist').addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List blacklisted users')),
  category: 'owner',
  aliases: ['bl'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(message.author.id)) {
      return message.reply(cv2(error('You are not authorized!')) as any);
    }

    const action = args[0]?.toLowerCase();
    const targetMatch = args[1]?.match(/<@!?(\d+)>/) || [null, args[1]];
    const targetId = targetMatch[1];
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (action === 'list') {
      return this.handleList(client, message);
    }

    if (!action || !targetId) {
      const prefix = process.env.PREFIX || '$';
      return message.reply(cv2(error(`Usage: \`${prefix}blacklist <add|remove|list> <@user> [reason]\``)) as any);
    }

    const user = await client.users.fetch(targetId).catch(() => null);
    if (!user) {
      return message.reply(cv2(error('Invalid user!')) as any);
    }

    await this.handleAction(client, message, action, user, reason);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(interaction.user.id)) {
      return interaction.reply(ephemeralCV2(error('This command is restricted to the bot owner.')) as any);
    }

    const action = interaction.options.getSubcommand();
    if (action === 'list') {
      return this.handleList(client, interaction);
    }

    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    await this.handleAction(client, interaction, action, user, reason);
  },

  async handleAction(client: CreoClient, context: any, action: string, user: User, reason: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    if (action === 'add') {
      try {
        await client.db.blacklist.upsert({
          where: { userId: user.id },
          update: { reason },
          create: { userId: user.id, reason }
        });
        await reply(cv2(container(`Blacklisted **${user.tag}** (\`${user.id}\`).\nReason: ${reason}`, { title: 'Blacklist Manager', color: 'success' })) as any);
      } catch (e: any) {
        await reply(cv2(container(`Failed to blacklist user: ${e.message}`, { title: 'Blacklist Manager', color: 'error' })) as any);
      }
    } else if (action === 'remove') {
      try {
        await client.db.blacklist.delete({ where: { userId: user.id } });
        await reply(cv2(container(`Removed **${user.tag}** (\`${user.id}\`) from the blacklist.`, { title: 'Blacklist Manager', color: 'success' })) as any);
      } catch (e: any) {
        await reply(cv2(container(`**${user.tag}** is not blacklisted.`, { title: 'Blacklist Manager', color: 'error' })) as any);
      }
    }
  },

  async handleList(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    try {
      const list = await client.db.blacklist.findMany();
      if (list.length === 0) {
        return reply(cv2(container('No users are currently blacklisted.', { title: 'Blacklist Manager', color: 'default' })) as any);
      }
      const formatted = list.map(b => `<@${b.userId}> (\`${b.userId}\`) - ${b.reason || 'No reason'}`).join('\n');
      await reply(cv2(container(formatted, { title: 'Blacklisted Users', color: 'default' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`Failed to fetch blacklist: ${e.message}`, { title: 'Blacklist Manager', color: 'error' })) as any);
    }
  }
};
