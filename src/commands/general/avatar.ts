import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("View your or another user's avatar.")
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(false)),
  category: 'general',
  aliases: ['avatar', 'av'],

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

    const avatarUrl = targetUser.displayAvatarURL({ size: 4096, extension: 'png' });

    const c1 = new ContainerBuilder();
    const s1 = new SectionBuilder()
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emojis.general.customization} ${targetUser.displayName}'s Avatar\n\n> ${emojis.general.dot} **[Click here to download](${avatarUrl})**\n\n-# Creo - Made By FeroX Devs`)
      );
    c1.addSectionComponents(s1);

    await reply(cv2(c1) as any);
  }
};
