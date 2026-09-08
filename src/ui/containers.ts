import {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize
} from 'discord.js';
import emojis from '../utils/emojis';

export function container(content: string, options?: {
  title?: string;
  thumbnail?: string;
  color?: 'default' | 'error' | 'success' | 'premium' | 'warning';
  footer?: string;
}) {
  const c = new ContainerBuilder();

    let prefix = '';
  if (options?.color === 'error') {
    prefix = `${emojis.general.cross} `;
  } else if (options?.color === 'success') {
    prefix = `${emojis.general.tick} `;
  }

  if (prefix && options?.title) {
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${prefix}${options.title}`));
    c.addSeparatorComponents(new SeparatorBuilder());

        const contentTexts: TextDisplayBuilder[] = [new TextDisplayBuilder().setContent(content)];
    if (options?.footer) {
      contentTexts.push(new TextDisplayBuilder().setContent(`-# ${options.footer}`));
    }

        if (options?.thumbnail) {
      const section = new SectionBuilder()
        .addTextDisplayComponents(...contentTexts)
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(options.thumbnail));
      c.addSectionComponents(section);
    } else {
      c.addTextDisplayComponents(...contentTexts);
    }
  } else {
    const texts: TextDisplayBuilder[] = [];

    if (options?.title) {
      texts.push(new TextDisplayBuilder().setContent(`# ${options.title}`));
    }

    const contentText = prefix ? `${prefix}${content}` : content;
    texts.push(new TextDisplayBuilder().setContent(contentText));

    if (options?.footer) {
      texts.push(new TextDisplayBuilder().setContent(`-# ${options.footer}`));
    }

    if (options?.thumbnail) {
      const section = new SectionBuilder()
        .addTextDisplayComponents(...texts)
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(options.thumbnail));
      c.addSectionComponents(section);
    } else {
      c.addTextDisplayComponents(...texts);
    }
  }

  return c;
}

export function success(text: string) {
  return container(text, { color: 'success', title: 'Success' });
}

export function error(text: string) {
  return container(text, { color: 'error', title: 'Error' });
}

export function premiumOnly(featureName: string) {
  return container(`This feature (\`${featureName}\`) requires a higher Premium Tier.`, {
    color: 'premium',
    title: 'Premium Only'
  });
}

export function sectionWithThumb(title: string, desc: string, thumbnailUrl: string) {
  return new SectionBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${title}**`),
      new TextDisplayBuilder().setContent(desc)
    )
    .setThumbnailAccessory(new ThumbnailBuilder().setURL(thumbnailUrl));
}

export function layoutView(...containers: ContainerBuilder[]) {
  return containers;
}

export function ephemeralCV2(containerBuilder: ContainerBuilder | ContainerBuilder[]) {
  return {
    components: Array.isArray(containerBuilder) ? containerBuilder : [containerBuilder],
    flags: (MessageFlags as any).IsComponentsV2 | MessageFlags.Ephemeral
  };
}

export function cv2(containerBuilder: ContainerBuilder | ContainerBuilder[]) {
  return {
    components: Array.isArray(containerBuilder) ? containerBuilder : [containerBuilder],
    flags: (MessageFlags as any).IsComponentsV2
  };
}
