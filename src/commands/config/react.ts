import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';


export default {
  data: new SlashCommandBuilder()
    .setName('react')
    .setDescription('Manage auto-reactions for this server.')
    .addSubcommand(s => s.setName('add').setDescription('Add an auto-reaction').addStringOption(o => o.setName('trigger').setDescription('Trigger word/phrase').setRequired(true)).addStringOption(o => o.setName('reaction').setDescription('Emoji reaction').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove an auto-reaction').addStringOption(o => o.setName('trigger').setDescription('Trigger word/phrase').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List all auto-reactions'))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  category: 'auto react & respond',
  aliases: ['react'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply(cv2(container('You must be a Server Administrator to use this.', { title: 'Missing Permissions', color: 'error' })) as any);
    }

    const sub = args[0]?.toLowerCase();

    if (sub === 'add') {
      const trigger = args[1];
      const reaction = args[2];
      await this.addReact(client, message, trigger, reaction);
    } else if (sub === 'remove') {
      const trigger = args[1];
      await this.removeReact(client, message, trigger);
    } else if (sub === 'list') {
      await this.listReact(client, message);
    } else {
      const prefix = process.env.PREFIX || '$';
      const msg = `## ${emojis.general.autoreact} Auto React\n${emojis.general.dot} '${prefix}react add <trigger> <reaction>' - Add an auto-reaction.\n${emojis.general.dot} '${prefix}react remove <trigger>' - Remove an auto-reaction.\n${emojis.general.dot} '${prefix}react list' - List all auto-reactions.`;
      await message.reply(cv2(container(msg, { title: 'Auto-React Manager', color: 'default' })) as any);
    }
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      await this.addReact(client, interaction, interaction.options.getString('trigger', true), interaction.options.getString('reaction', true));
    } else if (sub === 'remove') {
      await this.removeReact(client, interaction, interaction.options.getString('trigger', true));
    } else if (sub === 'list') {
      await this.listReact(client, interaction);
    }
  },

  async addReact(client: CreoClient, context: any, trigger: string, reaction: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    if (!trigger || !reaction) {
      return reply(cv2(container('Please provide both a trigger and a reaction.', { title: 'Auto React', color: 'error' })) as any);
    }

    try {
      await client.db.autoReact.upsert({
        where: { guildId_trigger: { guildId: context.guildId!, trigger: trigger.toLowerCase() } },
        update: { reaction },
        create: { guildId: context.guildId!, trigger: trigger.toLowerCase(), reaction }
      });
      await reply(cv2(container(`Successfully added auto-reaction for \`${trigger}\` ➔ ${reaction}`, { title: 'Creo Auto-React', color: 'success' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`Failed to add auto-reaction: ${e.message}`, { title: 'Auto React', color: 'error' })) as any);
    }
  },

  async removeReact(client: CreoClient, context: any, trigger: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    if (!trigger) {
      return reply(cv2(container('Please provide a trigger to remove.', { title: 'Auto React', color: 'error' })) as any);
    }

    try {
      await client.db.autoReact.delete({
        where: { guildId_trigger: { guildId: context.guildId!, trigger: trigger.toLowerCase() } }
      });
      await reply(cv2(container(`Successfully removed auto-reaction for \`${trigger}\`.`, { title: 'Creo Auto-React', color: 'success' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`No auto-reaction found for \`${trigger}\`.`, { title: 'Auto React', color: 'error' })) as any);
    }
  },

  async listReact(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    const reacts = await client.db.autoReact.findMany({ where: { guildId: context.guildId! } });
    if (reacts.length === 0) {
      return reply(cv2(container('No auto-reactions are currently set up in this server.', { title: 'Creo Auto-React', color: 'default' })) as any);
    }

    const content = reacts.map(r => `\`${r.trigger}\` ➔ ${r.reaction}`).join('\n');
    await reply(cv2(container(content, { title: 'Auto-Reactions', color: 'default' })) as any);
  }
};
