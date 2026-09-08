import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, ephemeralCV2, error, success } from '../../ui/containers';
import { GuildPlayer } from '../../managers/PlayerManager';
import emojis from '../../utils/emojis';

export default {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join your voice channel'),
  aliases: ['j'],
  category: 'music',
  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply(ephemeralCV2(error('You need to be in a voice channel!')) as any);
    }

    let player = client.music.players.get(interaction.guildId!);
    if (!player) {
      player = await client.music.createPlayer({
        guildId: interaction.guildId!,
        textId: interaction.channelId,
        voiceId: voiceChannel.id,
        volume: 100,
      });
    } else {
      if (player.voiceId === voiceChannel.id) {
        return interaction.reply(ephemeralCV2(error('I am already in your voice channel.')) as any);
      }

      if (player.queue.current) {
        return interaction.reply(ephemeralCV2(error('I am already playing music in another voice channel.')) as any);
      }

      player.setVoiceChannel(voiceChannel.id);
    }

    let guildPlayer = client.guildPlayers.get(interaction.guildId!);
    if (!guildPlayer) {
      guildPlayer = new GuildPlayer(player);
      client.guildPlayers.set(interaction.guildId!, guildPlayer);
    }


        await interaction.reply(cv2(success(`Joined **${voiceChannel.name}**.`)) as any);
  }
};
