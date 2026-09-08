import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { CreoClient } from '../../bot';
import { success, cv2, container, error, ephemeralCV2 } from '../../ui/containers';
import emojis from '../../utils/emojis';

export default {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restart the bot (respawn all shards)'),
  category: 'owner',
  aliases: ['restart', 'reboot'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(message.author.id)) return;

    await this.handleAction(client, message);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!ownerIds.includes(interaction.user.id)) {
      return interaction.reply(ephemeralCV2(error('This command is restricted to the bot owner.')) as any);
    }

    await this.handleAction(client, interaction);
  },

  async handleAction(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const authorId = isInteraction ? context.user.id : context.author.id;
    
    // Get active players
    const players = client.guildPlayers.size;

    const c = container(`${emojis.general.dot} Are you sure you want to **RESTART** the bot?\n${emojis.general.dot} **Active Players Disrupted:** \`${players}\``, { 
      title: 'Confirm Restart', 
      color: 'warning' 
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('confirm_restart').setLabel('Confirm').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('cancel_restart').setLabel('Cancel').setStyle(ButtonStyle.Danger)
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
      if (i.customId === 'confirm_restart') {
        try {
          await i.update(cv2(container('Shutting down and restarting the bot...', { title: 'Creo Owner', color: 'success' })) as any);
          setTimeout(() => {
            client.destroy();
            process.exit(0);
          }, 1000);
        } catch (e: any) {
          await i.update(cv2(container(`Failed to restart: \`${e.message}\``, { title: 'Restart Error', color: 'error' })) as any);
        }
      } else {
        await i.update(cv2(container('Restart cancelled.', { title: 'Creo Owner', color: 'error' })) as any);
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
