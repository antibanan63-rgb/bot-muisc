import { SlashCommandBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, ephemeralCV2, cv2 } from '../../ui/containers';
import { GuildMember } from 'discord.js';
import { GuildPlayer } from '../../managers/PlayerManager';

export default {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a track and select it from a dropdown.')
    .addStringOption(o => o.setName('query').setDescription('What do you want to search for?').setRequired(true)),
  category: 'music',
  aliases: ['find', 'sr'],

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const query = interaction.options.getString('query', true);
    if (!query) {
      return interaction.reply(ephemeralCV2(error('Please provide a query!')) as any);
    }
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply(ephemeralCV2(error('You need to be in a voice channel to search music!')) as any);
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
      return interaction.reply(ephemeralCV2(error('No results found for that query.')) as any);
    }


        const tracks = res.tracks.slice(0, 10);


        const searchId = `search_${interaction.user.id}_${Date.now()}`;
    client.cache.set(searchId, tracks);

    const select = new StringSelectMenuBuilder()
      .setCustomId(`CreoX:search_select:${searchId}`)
      .setPlaceholder('Select a track to play...');

    tracks.forEach((t: any, idx: number) => {
      select.addOptions({
        label: t.title.substring(0, 95),
        description: t.author ? t.author.substring(0, 95) : 'Unknown Artist',
        value: idx.toString()
      });
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    const c = container(`Found **${tracks.length}** results for \`${query}\`.\nChoose the track you want to play from the dropdown below!`, { title: 'Search Results' });
    c.addActionRowComponents(row as any);

    await interaction.reply(cv2(c) as any);
  }
};

