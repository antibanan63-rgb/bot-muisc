import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { CreoClient } from '../bot';
import chalk from 'chalk';

export class EventHandler {
  constructor(private client: CreoClient) {}

  public async load() {
    const eventsPath = join(__dirname, '../events');
    const files = this.loadDir(eventsPath);

        let count = 0;
    for (const file of files) {
      const event = require(file).default;
      if (event && event.name && event.execute) {
        const emitter = event.emitter === 'music' ? this.client.music : this.client;
        if (event.once) {
          (emitter as any).once(event.name, (...args: any[]) => event.execute(...args, this.client));
        } else {
          (emitter as any).on(event.name, (...args: any[]) => event.execute(...args, this.client));
        }
        count++;
      }
    }
    return `Loaded ${count} events.`;
  }

  private loadDir(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir);
    for (const file of files) {
      const filePath = join(dir, file);
      if (statSync(filePath).isDirectory()) {
        this.loadDir(filePath, fileList);
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }
}
