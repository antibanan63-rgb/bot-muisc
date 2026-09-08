import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, cv2 } from '../../ui/containers';


export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current track and clear the queue.'),
  category: 'music',
  aliases: ['stop', 'leave'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    await this.handleAction(client, message);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction);
  },

  async handleAction(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    const player = client.music.players.get(context.guildId!);
    if (!player) {
      return reply(cv2(container('Not connected to a voice channel.', { title: 'Creo Music', color: 'error' })) as any);
    }

    const member = context.member || await context.guild.members.fetch(isInteraction ? context.user.id : context.author.id).catch(() => null);
    if (!member || !member.voice.channel || member.voice.channel.id !== player.voiceId) {
      return reply(cv2(container('You must be in the same voice channel as the bot.', { title: 'Creo Music', color: 'error' })) as any);
    }

    try {
      const is247 = await client.db.vc247.findUnique({ where: { guildId: context.guildId! } });
      const guildPlayer = client.guildPlayers.get(context.guildId!);
      if (guildPlayer) guildPlayer.isStopped = true;

      if (is247) {
        player.queue.clear();
        player.shoukaku.stopTrack();
        await reply(cv2(container('Stopped the music and cleared the queue. (24/7 Mode Active)', { title: 'Creo Music', color: 'success' })) as any);
      } else {
        player.destroy();
        await reply(cv2(container('Stopped the music and left the voice channel.', { title: 'Creo Music', color: 'success' })) as any);
      }
    } catch (e: any) {
      await reply(cv2(container(`Failed to stop player: ${e.message}`, { title: 'Creo Music', color: 'error' })) as any);
    }
  }
};
