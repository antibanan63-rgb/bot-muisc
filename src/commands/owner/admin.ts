import { SlashCommandBuilder, ChatInputCommandInteraction, User } from 'discord.js';
import { CreoClient } from '../../bot';
import { success, error, ephemeralCV2, cv2, container } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Manage Admin access for users')
    .addSubcommand(s => s.setName('add').setDescription('Grant admin access').addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove admin access').addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List admin users')),
  category: 'owner',
  aliases: ['admin'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(message.author.id)) return;

    const action = args[0]?.toLowerCase();
    const targetMatch = args[1]?.match(/<@!?(\d+)>/) || [null, args[1]];
    const targetId = targetMatch[1];

    if (!action) {
      const prefix = process.env.PREFIX || '$';
      return message.reply(cv2(error(`Usage: \`${prefix}admin <add|remove|list> [@user]\``)) as any);
    }

    let user: User | null = null;
    if (targetId) user = await client.users.fetch(targetId).catch(() => null);

    if (['add', 'remove'].includes(action) && !user) {
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
    const user = interaction.options.getUser('user');

    await this.handleAction(client, interaction, action, user);
  },

  async handleAction(client: CreoClient, context: any, action: string, user: User | null) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    if (action === 'add' && user) {
      await client.db.adminUser.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id }
      });
      await reply(cv2(container(`Successfully added <@${user.id}> to admin list.`, { title: 'Creo Admin', color: 'success' })) as any);
    } else if (action === 'remove' && user) {
      const existing = await client.db.adminUser.findUnique({ where: { userId: user.id } });
      if (existing) {
        await client.db.adminUser.delete({ where: { userId: user.id } });
        await reply(cv2(container(`Successfully removed <@${user.id}> from admin list.`, { title: 'Creo Admin', color: 'success' })) as any);
      } else {
        await reply(cv2(container(`**${user.tag}** was not in the admin list.`, { title: 'Creo Admin', color: 'error' })) as any);
      }
    } else if (action === 'list') {
      const data = await client.db.adminUser.findMany();
      if (data.length > 0) {
        const usersList = data.map(d => `<@${d.userId}> (\`${d.userId}\`)`).join('\n');
        await reply(cv2(container(usersList, { title: 'Creo Admin Users', color: 'success' })) as any);
      } else {
        await reply(cv2(container(`No admin users found.`, { title: 'Creo Admin Users', color: 'success' })) as any);
      }
    } else {
      await reply(cv2(container('Invalid action.', { title: 'Creo Admin', color: 'error' })) as any);
    }
  }
};
