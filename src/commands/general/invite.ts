import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container } from '../../ui/containers';
import emojis from '../../utils/emojis';

export default {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the invite link for the bot.'),
  category: 'general',
  aliases: ['inv', 'invitelink'],
  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    await this.handleAction(client, message, true);
  },
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction, false);
  },
  async handleAction(client: CreoClient, context: any, isPrefix: boolean) {
    const botName = client.user?.username || 'Bot';
    const c = container(`Click the button below to invite **${botName}** to your server!`, { 
      title: `${emojis.general.dot} Invite ${botName}`,
    });

    // In a real scenario, client.generateInvite could be used, but hardcoded or derived is fine.
    const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=8&scope=bot%20applications.commands`;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Invite Me')
        .setURL(inviteLink)
        .setStyle(ButtonStyle.Link)
    );
    c.addActionRowComponents(row as any);

    if (isPrefix) {
      await context.reply(cv2(c) as any);
    } else {
      await context.reply(cv2(c) as any);
    }
  }
};
