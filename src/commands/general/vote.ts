import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container } from '../../ui/containers';
import emojis from '../../utils/emojis';

export default {
  data: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Vote for the bot to support us!'),
  category: 'general',
  aliases: ['voted'],
  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    await this.handleAction(client, message, true);
  },
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction, false);
  },
  async handleAction(client: CreoClient, context: any, isPrefix: boolean) {
    const botName = client.user?.username || 'Bot';
    const c = container(`Voting helps us grow and keeps the bot free! Click the button below to vote for **${botName}**.`, { 
      title: `${emojis.general.premium} Vote for ${botName}`,
    });

    const voteLink = `https://top.gg/bot/${client.user?.id}/vote`; // top.gg vote link

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Vote on Top.gg')
        .setURL(voteLink)
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
