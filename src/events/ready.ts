import { Events, Client } from 'discord.js';
import chalk from 'chalk';
import { CreoClient } from '../bot';
import { updateBotPresence } from '../utils/presence';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(clientNative: any, client: CreoClient) {
    updateBotPresence(client);

        setInterval(() => {
      updateBotPresence(client);
    }, 15000);

        const applicationCommands = client.commands.map(cmd => cmd.data.toJSON());

        try {
      await client.application?.commands.set(applicationCommands);
    } catch (error) {
      console.error(chalk.red(`[BOT] Failed to register global application commands:`), error);
    }
  }
};
