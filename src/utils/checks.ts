import { GuildMember, CommandInteraction, ButtonInteraction } from 'discord.js';

export function inSameVoiceChannel(interaction: CommandInteraction | ButtonInteraction): boolean {
  const member = interaction.member as GuildMember;
  const botMember = interaction.guild?.members.cache.get(interaction.client.user.id);

  if (!member.voice.channel) {
    return false;
  }

  if (botMember?.voice.channel && member.voice.channel.id !== botMember.voice.channel.id) {
    return false;
  }

  return true;
}

export function isUserInVoice(interaction: CommandInteraction | ButtonInteraction): boolean {
  const member = interaction.member as GuildMember;
  return !!member.voice.channel;
}
