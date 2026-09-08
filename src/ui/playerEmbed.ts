import { ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, ActionRowBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonBuilder } from 'discord.js';
import { KazagumoTrack } from 'kazagumo';
import { formatDuration, createProgressBar } from '../utils/format';
import { createMusicButtons } from './components';
import emojis from '../utils/emojis';


function getSourceEmoji(sourceName: string): string {
  const map: Record<string, string> = {
    youtube: emojis.music.youtube,
    soundcloud: emojis.music.soundcloud,
    spotify: emojis.music.spotify, 
    jiosaavn: emojis.music.jiosaavn,
    deezer: emojis.music.deezer,
  };
  return map[sourceName?.toLowerCase()] || emojis.music.youtube;
}

function getSourceLink(track: KazagumoTrack): string {
  const source = track.sourceName?.toLowerCase() || '';
  const emoji = getSourceEmoji(source);

  if (source === 'spotify') return `${emoji} [Listen on Spotify](${track.uri})`;
  if (source === 'jiosaavn') return `${emoji} [Listen on JioSaavn](${track.uri})`;
  if (source === 'soundcloud') return `${emoji} [Listen on SoundCloud](${track.uri})`;
  if (source === 'deezer') return `${emoji} [Listen on Deezer](${track.uri})`;
  return `${emoji} [Listen on YouTube](${track.uri})`;
}

export function buildPlayerUI(
  guildId: string,
  track: KazagumoTrack,
  position: number,
  isPlaying: boolean,
  loopMode: number,
  queueSize: number,
  volume: number,
  autoplay: boolean,
  requesterName?: string
): ContainerBuilder {
  const container = new ContainerBuilder(); 

  const sec = (track.length || 0) / 1000;
  const duration = `${Math.floor(sec / 60).toString().padStart(2, '0')}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
  let reqName = 'Autoplay';
  if (requesterName) reqName = requesterName;
  else if (track.requester) {
    const rId = (track.requester as any).id || track.requester;
    const isBot = (track.requester as any).bot === true;
    if (!isBot && rId !== 'autoplay') {
      reqName = `<@${rId}>`;
    }
  }

  const mainTrackInfo = `# ${emojis.music.playing} Now Playing\n### **${track.title}**`;
  const extraInfo = `> ${emojis.general.dot} **Author:** \`${track.author || 'FeroX GGs'}\`\n> ${emojis.general.dot} **Duration:** \`${duration}\`\n> ${emojis.general.dot} **Source:** ${getSourceLink(track)}\n\n${emojis.general.team} **Requested by:** ${reqName}\n\n-# Creo - Made By FeroX Devs`;

  const section = new SectionBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(mainTrackInfo));

  if (track.thumbnail) {
    section.setThumbnailAccessory(new ThumbnailBuilder().setURL(track.thumbnail));
  } else {
    section.setThumbnailAccessory(new ThumbnailBuilder().setURL('https://cdn.discordapp.com/embed/avatars/0.png'));
  }

  container.addSectionComponents(section);
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(extraInfo));
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

  const { row1, row2 } = createMusicButtons(guildId, isPlaying, loopMode, autoplay);

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(...row1),
    new ActionRowBuilder<ButtonBuilder>().addComponents(...row2)
  );

  return container;
}

