import { Events, Interaction, MessageFlags } from 'discord.js';
import { CreoClient } from '../bot';
import { error, ephemeralCV2 } from '../ui/containers';
import { Logger } from '../utils/logger';

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: CreoClient) {
    try {
      const blacklisted = await client.db.blacklist.findUnique({ where: { userId: interaction.user.id } });
      if (blacklisted) return;
    } catch {}

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        Logger.logCommand(interaction.user, interaction.guild, interaction.commandName, 'Slash');
        await command.execute(interaction, client);
      } catch (err) {
        console.error(err);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(ephemeralCV2(error('There was an error while executing this command!')));
        } else {
          await interaction.reply(ephemeralCV2(error('There was an error while executing this command!')));
        }
      }
    } else if (interaction.isButton()) {
      await client.componentHandler.handleButton(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await client.componentHandler.handleSelectMenu(interaction);
    } else if (interaction.isModalSubmit()) {
      await client.componentHandler.handleModalSubmit(interaction);
    }
  }
};
