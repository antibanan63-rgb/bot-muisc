import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionsBitField,
  ActionRowBuilder,
  SeparatorBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder
} from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container, success, error } from '../../ui/containers';
import emojis from '../../utils/emojis';
import { FONTS, EFFECTS, COLORS, getCustomIdPrefix } from '../premium/bnameplate';

export async function buildGlobalNameplateUI(
  client: any,
  fontId: number,
  effectId: number,
  colorId: number,
  callerId: string,
  menuType: 'main' | 'font' | 'style' | 'color' = 'main'
) {
  const containerBuilder = new ContainerBuilder();

  const fontName = FONTS[fontId]?.name || 'Default';
  const effectName = EFFECTS[effectId]?.name || 'Solid';
  
  let colorName = COLORS[colorId]?.name || 'White';
  if (colorId === 999) {
    const cached = client.nameplateCache?.get(`GLOBAL-${callerId}`);
    if (cached?.hexColors) {
      const displayHex = effectId === 2 ? cached.hexColors : [cached.hexColors[0]];
      colorName = `Custom (${displayHex.map((h: string) => h.startsWith('#') ? h : '#' + h).join(', ')})`;
    } else {
      colorName = 'Custom (Not Set)';
    }
  }

  const textContent = "# " + emojis.general.settings + " Global Nameplate Customizer\n*Change the bot's display name for ALL servers that haven't customized it themselves.*\n\n" + emojis.general.dot + " **Font:** `" + fontName + "` (ID: " + fontId + ")\n" + emojis.general.dot + " **Text Effect:** `" + effectName + "` (ID: " + effectId + ")\n" + emojis.general.dot + " **Color:** `" + colorName + "` (ID: " + colorId + ")\n\n" + emojis.general.premium + " *This will overwrite the default look everywhere!*";

  containerBuilder.addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent));
  containerBuilder.addSeparatorComponents(new SeparatorBuilder());

  const customPrefix = getCustomIdPrefix(client);

  if (menuType === 'main') {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:gnp:font_menu:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Choose Font')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:gnp:style_menu:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Choose Text Effect')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:gnp:color_menu:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Choose Colour')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${customPrefix}:gnp:save:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Save Globally')
        .setEmoji(emojis.general.tick)
        .setStyle(ButtonStyle.Success)
    );
    containerBuilder.addActionRowComponents(row as any);
  } else if (menuType === 'font') {
    const select = new StringSelectMenuBuilder()
      .setCustomId(`${customPrefix}:gnp:set_font:${fontId}:${effectId}:${colorId}:${callerId}`)
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
        .setCustomId(`${customPrefix}:gnp:main:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setLabel('Back')
        .setStyle(ButtonStyle.Secondary)
    );

    containerBuilder.addActionRowComponents(new ActionRowBuilder().addComponents(select) as any);
    containerBuilder.addActionRowComponents(btnRow as any);
  } else if (menuType === 'style') {
    const select = new StringSelectMenuBuilder()
      .setCustomId(`${customPrefix}:gnp:set_style:${fontId}:${effectId}:${colorId}:${callerId}`)
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
        .setCustomId(`${customPrefix}:gnp:main:${fontId}:${effectId}:${colorId}:${callerId}`)
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
        .setCustomId(`${customPrefix}:gnp:set_color_grad1:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setPlaceholder('Select First Gradient Color...')
        .addOptions(selectOptions1);

      const select2 = new StringSelectMenuBuilder()
        .setCustomId(`${customPrefix}:gnp:set_color_grad2:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setPlaceholder('Select Second Gradient Color...')
        .addOptions(selectOptions2);

      const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${customPrefix}:gnp:main:${fontId}:${effectId}:${colorId}:${callerId}`)
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
        .setCustomId(`${customPrefix}:gnp:set_color:${fontId}:${effectId}:${colorId}:${callerId}`)
        .setPlaceholder('Select a color theme...')
        .addOptions(selectOptions);

      const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${customPrefix}:gnp:main:${fontId}:${effectId}:${colorId}:${callerId}`)
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
    .setName('gnameplate')
    .setDescription('Change the bot\'s display nameplate globally (Owner Only).')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  category: 'owner',
  aliases: ['gnameplate', 'gstyle'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    await this.handleAction(client, message);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    await this.handleAction(client, interaction);
  },

  async handleAction(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    const ownerIds = process.env.OWNER_ID?.split(',').map((id: string) => id.trim()) || [];
    if (!ownerIds.includes(authorId)) {
      return reply(cv2(container('You must be a Bot Owner to use this command.', { title: 'Missing Permissions', color: 'error' })) as any);
    }

    const fontId = 11;
    const effectId = 1;
    const colorId = 9;

    const ui = await buildGlobalNameplateUI(client, fontId, effectId, colorId, authorId, 'main');
    await reply(cv2(ui) as any);
  }
};


