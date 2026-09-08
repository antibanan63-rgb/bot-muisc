import { readdirSync } from 'fs';
import { join } from 'path';
import { CreoClient } from '../bot';
import { SlashCommandBuilder, ApplicationCommandOptionType } from 'discord.js';
import chalk from 'chalk';

export class CommandHandler {
  constructor(private client: CreoClient) {}

  public async load() {
    this.client.commands.clear();
    this.client.aliases.clear();

    const commandsPath = join(__dirname, '../commands');
    const categories = readdirSync(commandsPath);

    let count = 0;
    for (const category of categories) {
      const categoryPath = join(commandsPath, category);
      const files = readdirSync(categoryPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

            for (const file of files) {
        const req = require(join(categoryPath, file));
        const command = req.default || req.command;

                if (command) {

                    if (!command.data && command.name) {
            command.data = new SlashCommandBuilder()
              .setName(command.name)
              .setDescription(command.description || 'No description provided');

                          if (command.options) {
              command.options.forEach((opt: any) => {
                if (opt.type === ApplicationCommandOptionType.User) {
                  command.data.addUserOption((o: any) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false));
                } else if (opt.type === ApplicationCommandOptionType.String) {
                  command.data.addStringOption((o: any) => {
                    o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false);
                    if (opt.choices) {
                        o.addChoices(...opt.choices);
                    }
                    return o;
                  });
                } else if (opt.type === ApplicationCommandOptionType.Integer) {
                  command.data.addIntegerOption((o: any) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false));
                }
              });
            }
          }

          if (command.data && command.execute) {
            this.client.commands.set(command.data.name, command);
            if (command.aliases && Array.isArray(command.aliases)) {
              command.aliases.forEach((alias: string) => {
                this.client.aliases.set(alias, command.data.name);
              });
            }
            count++;
          }
        }
      }
    }
    return `Loaded ${count} commands across ${categories.length} categories.`;
  }
}
