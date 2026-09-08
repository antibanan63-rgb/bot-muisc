import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';


export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription("View your or another user's profile.")
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(false)),
  category: 'general',
  aliases: ['profile'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    let user = message.mentions.users.first();
    if (!user && args.length > 0) {
      user = await client.users.fetch(args[0].replace(/[<@!>]/g, '')).catch(() => null);
    }
    if (!user) user = message.author;
    await this.handleAction(client, message, user);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    await this.handleAction(client, interaction, targetUser);
  },

  async handleAction(client: CreoClient, context: any, targetUser: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    const createdAt = `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`;

    let npStatus = 'Not Granted';
    let npAccess = 'Not Granted';

        try {
        const npData = await client.db.noPrefixUser.findUnique({ where: { userId: targetUser.id } });
        if (npData) {
            if (npData.expiresAt && npData.expiresAt.getTime() > Date.now()) {
                npStatus = `Active (Expires <t:${Math.floor(npData.expiresAt.getTime() / 1000)}:R>)`;
                npAccess = 'Granted';
            } else if (!npData.expiresAt) {
                npStatus = 'Active (Lifetime)';
                npAccess = 'Granted';
            }
        }
    } catch {}

    const badges = [`${emojis.badges.member} Member`];
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (ownerIds.includes(targetUser.id)) badges.push(`${emojis.badges.owner} Owner`);
    try {
        const isAdmin = await client.db.adminUser.findUnique({ where: { userId: targetUser.id } });
        if (isAdmin) badges.push(`${emojis.badges.admin} Admin`);
        const isPremium = await client.db.premiumUser.findUnique({ where: { userId: targetUser.id } });
        if (isPremium) badges.push(`${emojis.badges.premium} Premium`);
    } catch {}

    const containers: ContainerBuilder[] = [];

    const c1 = new ContainerBuilder();
    const s1 = new SectionBuilder()
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(targetUser.displayAvatarURL({ size: 4096 })))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emojis.general.stats} User Profile\n### *Creo - Made By FeroX Devs*\n\n> ${emojis.general.dot} **User:** <@${targetUser.id}>\n> ${emojis.general.dot} **ID:** \`${targetUser.id}\`\n> ${emojis.general.dot} **Created:** ${createdAt}\n\n> ${emojis.general.customization} **NoPrefix Status**\n> ${emojis.general.dot} **Access:** \`${npAccess}\`\n> ${emojis.general.dot} **Status:** \`${npStatus}\``
        )
      );
    c1.addSectionComponents(s1);
    containers.push(c1);

    const c2 = new ContainerBuilder();
    const bullets = badges.map(b => `> ${b}`).join('\n');
    c2.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${emojis.general.premium} Badges Achieved\n${bullets}`));
    containers.push(c2);

    await reply(cv2(containers) as any);
  }
};
