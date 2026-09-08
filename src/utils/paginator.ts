import { ContainerBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageActionRowComponentBuilder } from 'discord.js';
import emojis from './emojis';

export function createPaginator(
  items: string[],
  page: number,
  pageSize: number,
  customIdPrefix: string,
  guildId: string,
  title: string
): ContainerBuilder {
  const container = new ContainerBuilder();
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const start = (currentPage - 1) * pageSize;
  const currentItems = items.slice(start, start + pageSize);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${emojis.general.stats} ${title}`),
    new TextDisplayBuilder().setContent(currentItems.length > 0 ? currentItems.join('\n') : `> ${emojis.general.cross} No items to display.`)
  );

  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Page ${currentPage} / ${totalPages} • Creo - Made By FeroX Devs`));

  const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}:prev:${guildId}:${currentPage - 1}`)
      .setLabel('Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage <= 1),
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}:next:${guildId}:${currentPage + 1}`)
      .setLabel('Next')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages)
  );

  container.addActionRowComponents(row);

  return container;
}
