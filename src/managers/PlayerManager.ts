import { KazagumoPlayer } from 'kazagumo';
import { QueueManager } from './QueueManager';
import { FilterManager } from './FilterManager';
import { User, TextChannel, Message } from 'discord.js';

export interface VoteSkipState {
  skip: Set<string>;
  required: number;
}

export class GuildPlayer {
  public player: KazagumoPlayer;
  public queue: QueueManager; // Unused legacy queue property. Kazagumo's player.queue is the source of truth.
  public filters: FilterManager;
  public textChannel: TextChannel | null = null;
  public textChannelId: string | null = null;
  public playerMessageId: string | null = null;
  public lastActivity: number;
  public requesters: Map<string, User> = new Map();
  public votes: VoteSkipState = { skip: new Set(), required: 0 };
  public autoplay: boolean = false;
  public isStopped: boolean = false;

    constructor(player: KazagumoPlayer) {
    this.player = player;
    this.queue = new QueueManager();
    this.filters = new FilterManager(player);
    this.lastActivity = Date.now();
  }

    public async resendPanel(client: any): Promise<void> {
    if (!this.textChannelId) return;
    const channel = client.channels.cache.get(this.textChannelId) || await client.channels.fetch(this.textChannelId).catch(() => null);
    if (!channel) return;
    
    if (this.playerMessageId) {
      const msg = await channel.messages.fetch(this.playerMessageId).catch(() => null);
      if (msg) await msg.delete().catch(() => {});
    }
    
    const { buildPlayerUI } = require('../ui/playerEmbed');
    const { cv2 } = require('../ui/containers');
    const track = this.player.queue.current;
    if (!track) return;
    
    const loopMode = this.player.loop === 'none' ? 0 : this.player.loop === 'track' ? 1 : 2;
    const ui = buildPlayerUI(
      this.player.guildId,
      track,
      this.player.position,
      this.player.playing,
      loopMode,
      this.player.queue.length,
      this.player.volume,
      this.autoplay
    );
    
    const newMsg = await channel.send(cv2(ui) as any).catch(() => null);
    if (newMsg) this.playerMessageId = newMsg.id;
  }

  public updateActivity(): void {
    this.lastActivity = Date.now();
  }

  public resetVotes(required: number): void {
    this.votes = { skip: new Set(), required };
  }
}

