import { CommandInteraction, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../bot';

export interface Command {
  data: any;
  category?: string;
  execute: (interaction: ChatInputCommandInteraction, client: CreoClient) => Promise<void>;
  prefixExecute?: (client: CreoClient, message: any, args: string[]) => Promise<void>;
  aliases?: string[];
  premiumTier?: number;
  djOnly?: boolean;
}
