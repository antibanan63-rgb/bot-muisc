import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container } from '../../ui/containers';
import emojis from '../../utils/emojis';


export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Check the bot's latency."),
  category: 'general',
  aliases: ['latency'],
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const latency = Math.round(client.ws.ping);
    await interaction.reply(cv2(container(`${emojis.general.latency} Pong! \n\n**Websocket Latency:** ${latency}ms`, { title: 'FeroX Latency' })) as any);
  }
};
