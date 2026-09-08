import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container } from '../../ui/containers';
import emojis from '../../utils/emojis';

export default {
  data: new SlashCommandBuilder()
    .setName('support')
    .setDescription('Get the link to our official support server.'),
  category: 'general',
  aliases: ['support-server', 'server'],
  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    await this.handleAction(client, message, true);
  },
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction, false);
  },
  async handleAction(client: CreoClient, context: any, isPrefix: boolean) {
    const c = container(`Need help or have questions? Join our support server!`, { 
      title: `${emojis.general.team} Support Server`,
    });

    const supportLink = `https://discord.gg/ferox-music`; // Change if necessary

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Join Support Server')
        .setURL(supportLink)
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
