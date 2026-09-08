import { ShardingManager } from 'discord.js';
import { join } from 'path';
import 'dotenv/config';
import chalk from 'chalk';
import gradient from 'gradient-string';

// التحقق من الـ Token واش كاين ولا خاوي
const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
    console.error('❌ Error: Token is missing!');
    process.exit(1);
}

console.clear();
const themeGradient = gradient('#FF00D9', '#00E7FF', '#AD00FF');

const ascii = `
    ██████╗  ██████╗  ██████╗ ████████╗    █████╗  ██████╗ ██████╗ ███████╗███████╗
    ██╔══██╗██╔═══██╗██╔═══██╗╚══██╔══╝   ██╔══██╗██╔════╝██╔════╝ ██╔════╝██╔════╝
    ██████╔╝██║   ██║██║   ██║   ██║      ███████║██║     ██║      █████╗  ███████╗
    ██╔══██╗██║   ██║██║   ██║   ██║      ██╔══██║██║     ██║      ██╔══╝  ╚╚═══██║
    ██║  ██║╚██████╔╝╚██████╔╝   ██║      ██║  ██║╚██████╗╚██████╗ ███████╗███████║
    ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝
`;

console.log(themeGradient.multiline(ascii));
console.log(chalk.gray('    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.gray(`    [SYSTEM] Initializing Root Access Sharding Manager...`));

process.env.TS_NODE_TRANSPILE_ONLY = 'true';

const isTypeScript = __filename.endsWith('.ts') || process.env.TS_NODE === 'true' || !!process.env.TS_NODE_TRANSPILE_ONLY;
const targetBotFile = join(__dirname, isTypeScript ? 'bot.ts' : 'bot.js');

const manager = new ShardingManager(targetBotFile, {
  token: process.env.BOT_TOKEN,
  execArgv: isTypeScript 
    ? ['-r', 'ts-node/register', '--max-old-space-size=256'] 
    : ['--max-old-space-size=256']
});

manager.on('shardCreate', shard => {
  const shardPrefix = themeGradient(`[SHARD #${shard.id}]`);
  console.log(`${shardPrefix} ${chalk.cyan('Launched successfully.')}`);

  shard.on('ready', () => {
    console.log(`${shardPrefix} ${chalk.greenBright('Operational and ready!')}`);
  });

  shard.on('disconnect', () => {
    console.log(`${shardPrefix} ${chalk.red('Disconnected from gateway.')}`);
  });

  shard.on('reconnecting', () => {
    console.log(`${shardPrefix} ${chalk.yellow('Attempting to reconnect...')}`);
  });
});

manager.spawn({ timeout: -1 }).catch(error => {
  console.error(chalk.red('[SHARDING ERROR]'), error);
});