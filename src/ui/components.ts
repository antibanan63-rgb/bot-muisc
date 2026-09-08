import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import emojis from '../utils/emojis';


export function createMusicButtons(guildId: string, isPlaying: boolean, loopMode: number, autoplay: boolean = false) {
  const row1 = [
    new ButtonBuilder()
      .setCustomId(`CreoX:autoplay:${guildId}`)
      .setEmoji(emojis.music.autoplay)
      .setStyle(autoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`CreoX:prev:${guildId}`)
      .setEmoji(emojis.music.prev)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`CreoX:pause:${guildId}`)
      .setEmoji(isPlaying ? emojis.music.pause : emojis.music.play)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`CreoX:skip:${guildId}`)
      .setEmoji(emojis.music.next)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`CreoX:loop:${guildId}`)
      .setEmoji(emojis.music.loop)
      .setStyle(loopMode > 0 ? ButtonStyle.Success : ButtonStyle.Secondary),
  ];

  const row2 = [
    new ButtonBuilder()
      .setCustomId(`CreoX:shuffle:${guildId}`)
      .setEmoji(emojis.music.shuffle)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`CreoX:rewind:${guildId}`)
      .setEmoji(emojis.music.back)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`CreoX:stop:${guildId}`)
      .setEmoji(emojis.music.stop)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`CreoX:forward:${guildId}`)
      .setEmoji(emojis.music.forward)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`CreoX:heart:${guildId}`)
      .setEmoji(emojis.music.like)
      .setStyle(ButtonStyle.Secondary),
  ];

  return { row1, row2 };
}
