import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { CreoClient } from '../../bot';
import { success, error, ephemeralCV2, cv2, container } from '../../ui/containers';
import emojis from '../../utils/emojis';

export default {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload all commands or specific components')
    .addStringOption(o => o.setName('target').setDescription('What to reload').setRequired(true).addChoices({ name: 'Commands', value: 'commands' })),
  category: 'owner',
  aliases: ['reload'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(message.author.id)) return;

    await this.handleAction(client, message, 'commands');
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(interaction.user.id)) {
      return interaction.reply(ephemeralCV2(error('This command is restricted to the bot owner.')) as any);
    }

    const target = interaction.options.getString('target', true);
    await this.handleAction(client, interaction, target);
  },

  async handleAction(client: CreoClient, context: any, target: string) {
    const isInteraction = !!context.isCommand;
    const authorId = isInteraction ? context.user.id : context.author.id;
    
    // Get active players
    const players = client.guildPlayers.size;

    const c = container(`${emojis.general.dot} Are you sure you want to reload **${target}**?\n${emojis.general.dot} **Active Players Disrupted:** \`${players}\``, { 
      title: 'Confirm Reload', 
      color: 'warning' 
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('confirm_reload').setLabel('Confirm').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('cancel_reload').setLabel('Cancel').setStyle(ButtonStyle.Danger)
    );
    c.addActionRowComponents(row as any);

    const message = isInteraction 
      ? await context.reply({ ...cv2(c), fetchReply: true })
      : await context.reply(cv2(c) as any);

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i: any) => i.user.id === authorId,
      time: 15000
    });

    collector.on('collect', async (i: any) => {
      if (i.customId === 'confirm_reload') {
        try {
          if (target === 'commands') {
            client.commands.clear();
            await client.commandHandler.load();
            await i.update(cv2(container('Successfully reloaded all commands.', { title: 'Creo Owner', color: 'success' })) as any);
          } else {
            await i.update(cv2(container('Invalid reload target.', { title: 'Creo Owner', color: 'error' })) as any);
          }
        } catch (e: any) {
          await i.update(cv2(container(`Failed to reload \`${target}\`: \`${e.message}\``, { title: 'Reload Error', color: 'error' })) as any);
        }
      } else {
        await i.update(cv2(container('Reload cancelled.', { title: 'Creo Owner', color: 'error' })) as any);
      }
      collector.stop();
    });

    collector.on('end', (collected: any, reason: string) => {
      if (reason === 'time') {
        message.edit({ components: [] }).catch(() => {});
      }
    });
  }
};
