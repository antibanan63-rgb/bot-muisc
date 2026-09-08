import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import { CreoClient } from '../bot';
import { GuildPlayer } from '../managers/PlayerManager';
import { buildPlayerUI } from '../ui/playerEmbed';
import { MessageFlags, TextChannel } from 'discord.js';
import chalk from 'chalk';

export class MusicHandler {
  constructor(private client: CreoClient) {}

  public load() {
    this.client.music.shoukaku.on('ready', async (name) => {

            try {
        const vcs = await this.client.db.vc247.findMany();
        let reconnected = 0;
        for (const vc of vcs) {
          const guild = this.client.guilds.cache.get(vc.guildId);
          if (guild && !this.client.music.players.get(vc.guildId)) {
            const textId = guild.systemChannelId || guild.channels.cache.filter(c => c.isTextBased()).first()?.id;
            if (textId) {
              await this.client.music.createPlayer({
                guildId: vc.guildId,
                textId: textId as string,
                voiceId: vc.channelId,
                deaf: true,
                shardId: guild.shardId
              });
              reconnected++;
            }
          }
        }
        if (reconnected > 0) console.log(chalk.green(`[24/7] Reconnected to ${reconnected} voice channels.`));
      } catch (e) {
        console.error(chalk.red('[24/7] Error reconnecting:'), e);
      }
    });
    this.client.music.shoukaku.on('error', (name, error) => console.error(chalk.red(`[LAVALINK] Node ${name} error:`), error));
    this.client.music.shoukaku.on('close', (name, code, reason) => console.log(chalk.yellow(`[LAVALINK] Node ${name} closed with code ${code}: ${reason}`)));
    this.client.music.shoukaku.on('disconnect', (name, count) => console.log(chalk.yellow(`[LAVALINK] Node ${name} disconnected. (count: ${count})`)));

  }
}
