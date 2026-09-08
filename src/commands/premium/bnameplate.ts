import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  SeparatorBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container, success, error } from '../../ui/containers';
import emojis from '../../utils/emojis';

export const FONTS: Record<number, { name: string }> = {
  11: { name: 'Default' },
  1: { name: 'Tempo' },
  3: { name: 'Sakura' },
  4: { name: 'Jellybean' },
  6: { name: 'Modern' },
  7: { name: 'Medieval' },
  8: { name: '8bit' },
  10: { name: 'Vampyre' }
};

export const EFFECTS: Record<number, { name: string; id: number; colorReq: string }> = {
  1: { name: 'Solid', id: 1, colorReq: 'Requires exactly 1 color' },
  2: { name: 'Gradient', id: 2, colorReq: 'Requires exactly 2 colors (for blending)' },
  3: { name: 'Neon', id: 3, colorReq: 'Requires exactly 1 color' },
  4: { name: 'Toon', id: 4, colorReq: 'Requires exactly 1 color' },
  5: { name: 'Pop', id: 5, colorReq: 'Requires exactly 1 color' },
  6: { name: 'Glow', id: 6, colorReq: 'Requires exactly 1 color' }
};

export const COLORS: Record<number, { name: string; colors: number[] }> = {
  1: { name: 'Red', colors: [16711680] },
  2: { name: 'Green', colors: [65280] },
  3: { name: 'Blue', colors: [255] },
  4: { name: 'Yellow', colors: [16776960] },
  5: { name: 'Purple', colors: [8388736] },
  6: { name: 'Cyan', colors: [65535] },
  7: { name: 'Orange', colors: [16753920] },
  8: { name: 'Pink', colors: [16761035] },
  9: { name: 'White', colors: [16777215] }
};

export const getCustomIdPrefix = (client: any) => { return 'CreoX'; };

export async function buildNameplateUI(
  client: any,
  fontId: number,
  effectId: number,
  colorId: number,
  callerId: string,
  menuType: 'main' | 'font' | 'style' | 'color' = 'main',
  guildId?: string
) {
  const containerBuilder = new ContainerBuilder();

  const fontName = FONTS[fontId]?.name || 'Default';
  const effectName = EFFECTS[effectId]?.name || 'Solid';
  
  let colorName = COLORS[colorId]?.name || 'White';
  if (colorId === 999 && guildId) {
    const cached = client.nameplateCache?.get(`${guildId}-${callerId}`);
    if (cached?.hexColors) {
      const displayHex = effectId === 2 ? cached.hexColors : [cached.hexColors[0]];
      colorName = `Custom (${displayHex.map((h: string) => h.startsWith('#') ? h : '#' + h).join(', ')})`;
    } else {
      colorName = 'Custom (Not Set)';
    }
  }

  const textContent = "# " + emojis.general.customization + " Bot Nameplate Customizer\n*Change the typography, text effects, and colors of the bot's display name in this server.*\n\n" + emojis.general.dot + " **Font:** `" + fontName + "` (ID: " + fontId + ")\n" + emojis.general.dot + " **Text Effect:** `" + effectName + "` (ID: " + effectId + ")\n" + emojis.general.dot + " **Color:** `" + colorName + "` (ID: " + colorId + ")\n\n" + emojis.general.premium + " *This premium styling only applies to this server. Click **Save** to apply!*";

  containerBuilder.addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent));
  containerBuilder.addSeparatorComponents(new SeparatorBuilder());

  const customPrefix = getCustomIdPrefix(client);

  if (menuType === 'main') {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:np:font_menu:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Choose Font')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:np:style_menu:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Choose Text Effect')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:np:color_menu:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Choose Colour')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:np:save:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Save')
        .setEmoji(emojis.general.tick)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:np:reset:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Reset')
        .setEmoji(emojis.general.cross)
        .setStyle(ButtonStyle.Danger)
    );
    containerBuilder.addActionRowComponents(row as any);
  } else if (menuType === 'font') {
    const select = new StringSelectMenuBuilder()
      .setCustomId(`${customPrefix}:np:set_font:${fontId}:${effectId}:${colorId}:${callerId}`)
      .setPlaceholder('Select a font...')
      .addOptions(
        Object.entries(FONTS).map(([id, info]) => ({
          label: info.name,
          value: id,
          description: `Apply the ${info.name} font.`
        }))
      );

    const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:np:main:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Back')
        .setStyle(ButtonStyle.Secondary)
    );

    containerBuilder.addActionRowComponents(new ActionRowBuilder().addComponents(select) as any);
    containerBuilder.addActionRowComponents(btnRow as any);
  } else if (menuType === 'style') {
    const select = new StringSelectMenuBuilder()
      .setCustomId(`${customPrefix}:np:set_style:${fontId}:${effectId}:${colorId}:${callerId}`)
      .setPlaceholder('Select a text effect...')
      .addOptions(
        Object.entries(EFFECTS).map(([id, info]) => ({
          label: info.name,
          value: id,
          description: info.colorReq
        }))
      );

    const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:np:main:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Back')
        .setStyle(ButtonStyle.Secondary)
    );

    containerBuilder.addActionRowComponents(new ActionRowBuilder().addComponents(select) as any);
    containerBuilder.addActionRowComponents(btnRow as any);
  } else if (menuType === 'color') {
    if (effectId === 2) {
      const selectOptions1 = [
        ...Object.entries(COLORS).map(([id, info]) => ({
          label: info.name,
          value: id,
          description: `Set first gradient color to ${info.name}.`
        })),
        {
          label: 'Custom Color',
          value: 'custom',
          description: 'Enter custom Hex color code(s).'
        }
      ];

      const selectOptions2 = [
        ...Object.entries(COLORS).map(([id, info]) => ({
          label: info.name,
          value: id,
          description: `Set second gradient color to ${info.name}.`
        })),
        {
          label: 'Custom Color',
          value: 'custom',
          description: 'Enter custom Hex color code(s).'
        }
      ];

      const select1 = new StringSelectMenuBuilder()
        .setCustomId(`${customPrefix}:np:set_color_grad1:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setPlaceholder('Select First Gradient Color...')
        .addOptions(selectOptions1);

      const select2 = new StringSelectMenuBuilder()
        .setCustomId(`${customPrefix}:np:set_color_grad2:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setPlaceholder('Select Second Gradient Color...')
        .addOptions(selectOptions2);

      const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${customPrefix}:np:main:${fontId}:${effectId}:${colorId}:${callerId}`)
          .setLabel('Back')
          .setStyle(ButtonStyle.Secondary)
      );

      containerBuilder.addActionRowComponents(new ActionRowBuilder().addComponents(select1) as any);
      containerBuilder.addActionRowComponents(new ActionRowBuilder().addComponents(select2) as any);
      containerBuilder.addActionRowComponents(btnRow as any);
    } else {
      const selectOptions = [
        ...Object.entries(COLORS).map(([id, info]) => ({
          label: info.name,
          value: id,
          description: `Apply the ${info.name} color.`
        })),
        {
          label: 'Custom Color',
          value: 'custom',
          description: 'Enter custom Hex color code(s).'
        }
      ];

      const select = new StringSelectMenuBuilder()
        .setCustomId(`${customPrefix}:np:set_color:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setPlaceholder('Select a color theme...')
        .addOptions(selectOptions);

      const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${customPrefix}:np:main:${fontId}:${effectId}:${colorId}:${callerId}`)
          .setLabel('Back')
          .setStyle(ButtonStyle.Secondary)
      );

      containerBuilder.addActionRowComponents(new ActionRowBuilder().addComponents(select) as any);
      containerBuilder.addActionRowComponents(btnRow as any);
    }
  }

  return containerBuilder;
}

export default {
  data: new SlashCommandBuilder()
    .setName('bnameplate')
    .setDescription('Change the bot\'s display nameplate style in this server (Premium Only).')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  category: 'premium',
  aliases: ['bnameplate', 'bstyle'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== message.guild?.ownerId) {
      return message.reply(cv2(container('You must be a Server Administrator or Owner to use this.', { title: 'Missing Permissions', color: 'error' })) as any);
    }
    await this.handleAction(client, message);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction);
  },

  async handleAction(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    const isPremium = await client.db.premiumUser.findUnique({ where: { userId: authorId } });
    const ownerIds = process.env.OWNER_ID?.split(',').map((id: string) => id.trim()) || [];
    if (!isPremium && !ownerIds.includes(authorId)) {
      return reply(cv2(container('This command is exclusively for Premium Users.', { title: `${client.user!.username} Premium`, color: 'error' })) as any);
    }

    const guildConfig = await client.db.guildConfig.findUnique({
      where: { guildId: context.guildId! }
    });

    const fontId = guildConfig?.nameplateFontId ?? 11;
    const effectId = guildConfig?.nameplateEffectId ?? 1;
    const colorsString = guildConfig?.nameplateColors ?? "16777215";
    const hexString = guildConfig?.nameplateHex ?? "#FFFFFF";

    const decimals = colorsString.split(',').map(d => parseInt(d));
    let colorId = 9;
    let foundMatch = false;
    for (const [idStr, info] of Object.entries(COLORS)) {
      const id = parseInt(idStr);
      if (info.colors.length === decimals.length && info.colors.every((val, index) => val === decimals[index])) {
        colorId = id;
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      colorId = 999;
      if (!(client as any).nameplateCache) {
        (client as any).nameplateCache = new Map();
      }
      const hexColors = hexString.split(',');
      (client as any).nameplateCache.set(`${context.guildId}-${authorId}`, {
        hexColors,
        decColors: decimals
      });
    }

    const ui = await buildNameplateUI(client, fontId, effectId, colorId, authorId, 'main', context.guild?.id);
    await reply(cv2(ui) as any);
  }
};



