import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, cv2 } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current track.'),
  category: 'music',
  aliases: ['skip', 's'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    await this.handleAction(client, message);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction);
  },

  async handleAction(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = async (content: any) => {
      if (isInteraction) {
        return context.deferred || context.replied ? context.editReply(content) : context.reply(content);
      }
      return context.reply(content);
    };

    const player = client.music.players.get(context.guildId!);
    if (!player || !player.queue.current) {
      return reply(cv2(container('No track currently playing.', { title: 'Creo Music', color: 'error' })) as any);
    }

    const member = context.member || await context.guild.members.fetch(isInteraction ? context.user.id : context.author.id).catch(() => null);
    if (!member || !member.voice.channel || member.voice.channel.id !== player.voiceId) {
      return reply(cv2(container('You must be in the same voice channel as the bot.', { title: 'Creo Music', color: 'error' })) as any);
    }

    try {
      player.skip();
      await reply(cv2(container('Skipped the current track.', { title: 'Creo Music', color: 'default' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`Failed to skip track: ${e.message}`, { title: 'Creo Music', color: 'error' })) as any);
    }
  }
};
