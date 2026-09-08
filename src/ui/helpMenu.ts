import { ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, ActionRowBuilder, SeparatorBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CreoClient } from '../bot';
import emojis from '../utils/emojis';


import { getCustomIdPrefix } from '../commands/premium/bnameplate';

export function buildHelpMenu(category = 'Home', client: CreoClient, userId?: string): ContainerBuilder {
  const container = new ContainerBuilder();

  const botAvatarUrl = client.user!.displayAvatarURL({ size: 4096 });
  const commandCount = client.commands.filter(cmd => cmd.category?.toLowerCase() !== 'owner').size;
  const prefix = process.env.PREFIX || '$';
  const botId = client.user!.id;

  const textTop = `# ${emojis.help.dance} Creo Help Menu\n### *A Premium Experience Made By Root Access*\n\n> ${emojis.general.stats} **Statistics**\n> ${emojis.general.dot} **Commands:** \`${commandCount}\`\n> ${emojis.general.dot} **Prefix:** \`${prefix}\`\n\n`;
  const textBottom = `## ${emojis.help.peach} **Command Categories**\n\n> ${emojis.general.music} \`:\` **Music**\n> ${emojis.general.system} \`:\` **General**\n> ${emojis.general.autoreact} \`:\` **Config**\n> ${emojis.general.premium} \`:\` **Premium**\n> ${emojis.general.fun} \`:\` **Fun**\n\n-# Select a category from the dropdown below to explore commands!`;

  if (category === 'Home') {
    const section = new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(textTop))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(botAvatarUrl));

    container.addSectionComponents(section);
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(textBottom));
  } else {

        const categoryCommands = client.commands.filter(cmd => cmd.category?.toLowerCase() === category.toLowerCase());
    let commandsText = '';
    if (categoryCommands.size > 0) {
      const list = categoryCommands.map(cmd => `\`${cmd.data.name}\``).join(', ');
      commandsText = `## **${category} Commands:**\n> ${list}\n\n`;
    } else {
      commandsText = `## **${category} Commands:**\n> No commands found for this category.\n\n`;
    }

    const section = new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(textTop + commandsText))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(botAvatarUrl));
    container.addSectionComponents(section);
  }




        container.addSeparatorComponents(new SeparatorBuilder());

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`${getCustomIdPrefix(client)}:help_select${userId ? `:${userId}` : ''}`)
      .setPlaceholder('Select a category...')
      .addOptions(
        { label: "Home", description: "Return to the main help menu", emoji: emojis.general.home, value: "Home" },
        { label: "General", description: "General & Info commands", emoji: emojis.general.system, value: "General" },
        { label: "Music", description: "Music related commands", emoji: emojis.general.music, value: "Music" },
        { label: "Config", description: "Bot Configuration", emoji: emojis.general.autoreact, value: "Config" },
        { label: "Premium", description: "Premium features & commands", emoji: emojis.general.premium, value: "Premium" },
        { label: "Fun", description: "Fun & Games commands", emoji: emojis.general.fun, value: "Fun" }
      )
  );

  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel("Invite Bot").setURL(``).setStyle(ButtonStyle.Link),
    new ButtonBuilder().setLabel("Support Server").setURL("https://discord.gg/nJRBeUxrv").setStyle(ButtonStyle.Link)
  );

  container.addActionRowComponents(selectRow as any);
  container.addActionRowComponents(buttonRow as any);

  return container;
}
