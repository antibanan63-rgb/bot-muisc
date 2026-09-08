import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';

export default {
  data: new SlashCommandBuilder()
    .setName('liked')
    .setDescription('View and play your liked songs.')
    .addSubcommand(s => s.setName('list').setDescription('List your liked songs'))
    .addSubcommand(s => s.setName('play').setDescription('Play all your liked songs')),
  category: 'music',
  aliases: ['likedsongs', 'liked'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const sub = args[0]?.toLowerCase() || 'list';
    if (sub === 'play') {
      await this.play(client, message);
    } else {
      await this.list(client, message);
    }
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const sub = interaction.options.getSubcommand() || 'list';
    if (sub === 'play') {
      await this.play(client, interaction);
    } else {
      await this.list(client, interaction);
    }
  },

  async list(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    try {
      const liked = await client.db.likedTrack.findMany({ where: { userId: authorId }, orderBy: { addedAt: 'desc' } });
      if (liked.length === 0) {
        return reply(cv2(container('You have no liked songs yet.', { title: 'Creo Liked Songs', color: 'default' })) as any);
      }

            const content = liked.slice(0, 15).map((t: any, i: number) => `**${i + 1}.** [${t.title}](${t.uri})`).join('\n');
      const footer = liked.length > 15 ? `\n\n*...and ${liked.length - 15} more tracks*` : '';
      await reply(cv2(container(content + footer, { title: `# ${emojis.general.music} Your Liked Songs`, color: 'default', footer: 'Creo - Made By FeroX Devs' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`Error: ${e.message}`, { title: 'Creo Liked Songs', color: 'error' })) as any);
    }
  },

  async play(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    const member = context.member || await context.guild.members.fetch(authorId).catch(() => null);
    if (!member || !member.voice.channel) {
      return reply(cv2(container('You must be in a voice channel to play music.', { title: 'Creo Liked Songs', color: 'error' })) as any);
    }

    try {
      const liked = await client.db.likedTrack.findMany({ where: { userId: authorId }, orderBy: { addedAt: 'asc' } });
      if (liked.length === 0) {
        return reply(cv2(container('You have no liked songs to play.', { title: 'Creo Liked Songs', color: 'error' })) as any);
      }

      let player = client.music.players.get(context.guildId!);
      if (!player) {
        player = await client.music.createPlayer({
          guildId: context.guildId!,
          textId: context.channelId!,
          voiceId: member.voice.channel.id,
          deaf: true,
          shardId: context.guild.shardId
        });
      }

            const { GuildPlayer } = require('../../managers/PlayerManager');
      let guildPlayer = client.guildPlayers.get(context.guildId!);
      if (!guildPlayer) {
          guildPlayer = new GuildPlayer(player);
          client.guildPlayers.set(context.guildId!, guildPlayer as any);
      }

      const m = await (isInteraction ? context.reply({ content: `${emojis.general.loading} Loading your liked songs...`, fetchReply: true }) : context.reply(`${emojis.general.loading} Loading your liked songs...`));

      let loaded = 0;
      for (const track of liked) {
        const res = await client.music.search(track.uri, { requester: context.user || context.author });
        if (res.tracks.length > 0) {
          player.queue.add(res.tracks[0]);
          loaded++;
        }
      }

      if (!player.playing && !player.paused) {
        player.play();
      }

      const successMsg = cv2(container(`Added **${loaded}** liked songs to the queue!`, { title: 'Creo Liked Songs', color: 'success' }));
      if (isInteraction) {
        await context.editReply(successMsg as any);
      } else {
        if (m) await m.delete().catch(() => {});
        await context.reply(successMsg as any);
      }
    } catch (e: any) {
      await reply(cv2(container(`Error playing liked songs: ${e.message}`, { title: 'Creo Liked Songs', color: 'error' })) as any);
    }
  }
};

