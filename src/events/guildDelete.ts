import { Guild } from 'discord.js';
import { CreoClient } from '../bot';
import { Logger } from '../utils/logger';

export default {
  name: 'guildDelete',
  once: false,
  async execute(guild: Guild, client: CreoClient) {
    await Logger.logGuild(guild, 'LEAVE');
  }
};
