import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, success, error, ephemeralCV2, cv2 } from '../../ui/containers';
import { GuildPlayer } from '../../managers/PlayerManager';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song or playlist')
    .addStringOption(o => o.setName('query').setDescription('The song title or URL').setRequired(true)),
  aliases: ['p'],
  category: 'music',

    async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const query = interaction.options.getString('query', true);
    if (!query) {
      return interaction.reply(ephemeralCV2(error('Please provide a query or URL!')) as any);
    }
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply(ephemeralCV2(error('You need to be in a voice channel to play music!')) as any);
    }

    let player = client.music.players.get(interaction.guildId!);
    if (!player) {
      player = await client.music.createPlayer({
        guildId: interaction.guildId!,
        textId: interaction.channelId,
        voiceId: voiceChannel.id,
        volume: 100,
      });
    }

    let guildPlayer = client.guildPlayers.get(interaction.guildId!);
    if (!guildPlayer) {
      guildPlayer = new GuildPlayer(player);
      client.guildPlayers.set(interaction.guildId!, guildPlayer);
    }
    guildPlayer.textChannelId = interaction.channelId;
      guildPlayer.isStopped = false;

    const userConfig = await client.db.userConfig.findUnique({ where: { userId: interaction.user.id } });
    const dbEngine = userConfig?.searchEngine || 'ytsearch';
    
    const engineMap: Record<string, string> = {
      'ytsearch': 'youtube',
      'scsearch': 'soundcloud',
      'spsearch': 'spotify',
      'dzsearch': 'deezer',
      'jssearch': 'jiosaavn'
    };
    const engine = engineMap[dbEngine] || 'youtube';
    
    const res = await client.music.search(query, { requester: interaction.user, engine });

    if (!res.tracks.length) {
      return interaction.reply(ephemeralCV2(error('No results found.')) as any);
    }

    if (res.type === 'PLAYLIST') {
      for (const track of res.tracks) player.queue.add(track);
      await interaction.reply(cv2(success(`Added ${res.tracks.length} tracks from playlist **${res.playlistName || 'Unknown'}** to the queue.`)) as any);
      
      if (!player.playing && !player.paused) {
        player.play();
      } else {
        await guildPlayer.resendPanel(client);
      }
    } else {
      player.queue.add(res.tracks[0]);
      await interaction.reply(cv2(success(`Added **${res.tracks[0].title}** to the queue.`)) as any);

      if (!player.playing && !player.paused) {
        player.play();
      } else {
        await guildPlayer.resendPanel(client);
      }
    }
  }
};

