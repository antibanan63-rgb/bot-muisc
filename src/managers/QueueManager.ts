import { KazagumoTrack } from 'kazagumo';
import { LoopMode } from '../types';

/** NOTE: QueueManager is currently unused legacy code. Kazagumo's internal player.queue is the source of truth. */
export class QueueManager {
  public tracks: KazagumoTrack[] = [];
  public history: KazagumoTrack[] = [];
  public loop: LoopMode = LoopMode.NONE;
  public current: KazagumoTrack | null = null;

  public get size(): number {
    return this.tracks.length;
  }

  public get totalDuration(): number {
    return this.tracks.reduce((acc, track) => acc + (track.length || 0), 0);
  }

  public add(track: KazagumoTrack | KazagumoTrack[], position?: number): void {
    const toAdd = Array.isArray(track) ? track : [track];
    if (position !== undefined && position >= 0 && position <= this.tracks.length) {
      this.tracks.splice(position, 0, ...toAdd);
    } else {
      this.tracks.push(...toAdd);
    }
  }

  public remove(position: number): KazagumoTrack | null {
    if (position < 0 || position >= this.tracks.length) return null;
    return this.tracks.splice(position, 1)[0];
  }

  public move(from: number, to: number): boolean {
    if (from < 0 || from >= this.tracks.length || to < 0 || to >= this.tracks.length) return false;
    const [track] = this.tracks.splice(from, 1);
    this.tracks.splice(to, 0, track);
    return true;
  }

  public shuffle(): void {
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }
  }

  public clear(): void {
    this.tracks = [];
  }

  public skipto(position: number): KazagumoTrack[] {
    if (position < 0 || position >= this.tracks.length) return [];
    return this.tracks.splice(0, position);
  }

  public previous(): KazagumoTrack | null {
    if (this.history.length === 0) return null;
    return this.history.pop() || null;
  }
}
