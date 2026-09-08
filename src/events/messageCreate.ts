import { Events, Message, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CreoClient } from '../bot';
import { error, ephemeralCV2, cv2, container } from '../ui/containers';
import emojis from '../utils/emojis';
import { Logger } from '../utils/logger';

export default {
  name: Events.MessageCreate,
  async execute(message: Message, client: CreoClient) {
    if (message.author.bot || !message.guild) return;

    try {
      const blacklisted = await client.db.blacklist.findUnique({ where: { userId: message.author.id } });
      if (blacklisted) return;
    } catch {}

    let prefix = process.env.PREFIX || '$';
    try {
      const gConf = await client.db.guildConfig.findUnique({ where: { guildId: message.guildId! } });
      if (gConf && gConf.prefix) prefix = gConf.prefix;
    } catch {}

    if (message.mentions.has(client.user!.id) && !message.mentions.everyone && message.content.trim() === `<@${client.user!.id}>`) {
      const dot = emojis.general.dot;
      const content = 
        `## ${emojis.general.home} Welcome to Root Access\n` +
        `I am a feature-rich music bot designed to provide the best audio experience on Discord.\n\n` +
        `### ${emojis.general.settings} Getting Started\n` +
        `${dot} **Prefix:** My prefix in this server is \`${prefix}\`\n` +
        `${dot} **Commands:** Type \`${prefix}help\` to see all available commands.\n` +
        `${dot} **Support:** Click the button below to open the interactive help menu.\n\n` +
        `### ${emojis.general.music} How to Play Music\n` +
        `1. Join a voice channel.\n` +
        `2. Use \`${prefix}play <song name/url>\` to start playing.\n` +
        `3. Use the interactive player buttons to control the music!`;

      const ui = container(content, { 
        title: `${emojis.general.stats_icon} Root Access Introduction`,
        footer: `Root Access • v1.0.0`
      });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`CreoX:help_trigger:${message.guildId}:${message.author.id}`)
          .setLabel('Open Help Menu')
          .setEmoji(emojis.general.home)
          .setStyle(ButtonStyle.Secondary)
      );

      ui.addActionRowComponents(row as any);

      await message.reply(cv2(ui) as any);
      return;
    }

    try {
      const ignored = await client.db.ignoredChannel.findUnique({ where: { guildId_channelId: { guildId: message.guildId!, channelId: message.channelId } } });
      if (ignored) return;
    } catch {}

    try {
      const content = message.content.toLowerCase();

      const reactions = await client.db.autoReact.findMany({ where: { guildId: message.guildId! } });
      for (const r of reactions) {
        if (content.includes(r.trigger)) {
          await message.react(r.reaction).catch(() => {});
        }
      }

      const responses = await client.db.autoRespond.findMany({ where: { guildId: message.guildId! } });
      for (const r of responses) {
        if (content.includes(r.trigger) && message.channel.isTextBased()) {
          await (message.channel as any).send(r.response).catch(() => {});
        }
      }
    } catch {}

    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (ownerIds.some(id => message.content.includes(`<@${id}>`) || message.content.includes(`<@!${id}>`))) {
      try {
        await message.react(emojis.owner_reacts.botowners);
        await message.react(emojis.owner_reacts.owenr);
      } catch (e) { }
    }

    let isCommand = false;
    let usedPrefix = '';

    if (message.content.startsWith(prefix)) {
      isCommand = true;
      usedPrefix = prefix;
    }

    if (!isCommand) {
      const potentialCommand = message.content.trim().split(/ +/)[0].toLowerCase();
      if (client.commands.has(potentialCommand) || client.aliases.has(potentialCommand)) {
        try {
          const npData = await client.db.noPrefixUser.findUnique({ where: { userId: message.author.id } });
          if (npData) {
            if (npData.expiresAt && npData.expiresAt.getTime() < Date.now()) {
              await client.db.noPrefixUser.delete({ where: { userId: message.author.id } }).catch(() => {});
            } else {
              isCommand = true;
              usedPrefix = '';
            }
          }
        } catch {}
      }
    }

    if (!isCommand) return;

    const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName)!);

    if (!command) return;

    if (command.prefixExecute) {
      try {
        Logger.logCommand(message.author, message.guild, commandName, 'Prefix');
        await command.prefixExecute(client, message, args);
      } catch (e) {
        console.error(`Error executing prefix command ${commandName}:`, e);
        await message.reply(ephemeralCV2(error('An error occurred while executing this command.')) as any).catch(() => {});
      }
    } else if (command.execute) {

      const fakeInteraction: any = {
        user: message.author,
        member: message.member,
        guildId: message.guildId,
        channelId: message.channelId,
        guild: message.guild,
        channel: message.channel,
        reply: async (options: any) => message.reply(options),
        editReply: async (options: any) => message.reply(options),
        followUp: async (options: any) => message.reply(options),
        deferReply: async () => {}, 
        options: {
          getString: (name: string, required: boolean) => {
            if (['query', 'mode'].includes(name)) return args.join(' ') || null;
            return args[0] || null;
          },
          getUser: (name: string, required: boolean) => {
            if (message.mentions.users.size > 0) {
              if (name === 'user2' && message.mentions.users.size > 1) {
                return Array.from(message.mentions.users.values())[1];
              }
              return message.mentions.users.first();
            }
            return null;
          },
          getInteger: (name: string, required: boolean) => {
            const parsed = parseInt(args[0]);
            return isNaN(parsed) ? null : parsed;
          }
        }
      };

      try {
        Logger.logCommand(message.author, message.guild, commandName, 'Prefix');
        await command.execute(fakeInteraction, client);
      } catch (e) {
        console.error(`Error executing hybrid command ${commandName}:`, e);
        await message.reply(ephemeralCV2(error('An error occurred while executing this command.')) as any).catch(() => {});
      }
    } else {
      await message.reply(ephemeralCV2(error('This command is not configured correctly.')) as any);
    }
  }
};