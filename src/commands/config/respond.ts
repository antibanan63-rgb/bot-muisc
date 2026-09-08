import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';


export default {
  data: new SlashCommandBuilder()
    .setName('respond')
    .setDescription('Manage auto-responses for this server.')
    .addSubcommand(s => s.setName('add').setDescription('Add an auto-response').addStringOption(o => o.setName('trigger').setDescription('Trigger word/phrase').setRequired(true)).addStringOption(o => o.setName('response').setDescription('The response text').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove an auto-response').addStringOption(o => o.setName('trigger').setDescription('Trigger word/phrase').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List all auto-responses'))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  category: 'auto react & respond',
  aliases: ['respond', 'autorespond'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply(cv2(container('You must be a Server Administrator to use this.', { title: 'Missing Permissions', color: 'error' })) as any);
    }

    const sub = args[0]?.toLowerCase();

    if (sub === 'add') {
      const trigger = args[1];
      const response = args.slice(2).join(' ');
      await this.addRespond(client, message, trigger, response);
    } else if (sub === 'remove') {
      const trigger = args[1];
      await this.removeRespond(client, message, trigger);
    } else if (sub === 'list') {
      await this.listRespond(client, message);
    } else {
      const prefix = process.env.PREFIX || '$';
      const msg = `## ${emojis.general.autoreact} Auto Respond\n${emojis.general.dot} '${prefix}respond add <trigger> <response>' - Add an auto-response.\n${emojis.general.dot} '${prefix}respond remove <trigger>' - Remove an auto-response.\n${emojis.general.dot} '${prefix}respond list' - List all auto-responses.`;
      await message.reply(cv2(container(msg, { title: 'Auto-Respond Manager', color: 'default' })) as any);
    }
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      await this.addRespond(client, interaction, interaction.options.getString('trigger', true), interaction.options.getString('response', true));
    } else if (sub === 'remove') {
      await this.removeRespond(client, interaction, interaction.options.getString('trigger', true));
    } else if (sub === 'list') {
      await this.listRespond(client, interaction);
    }
  },

  async addRespond(client: CreoClient, context: any, trigger: string, response: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    if (!trigger || !response) {
      return reply(cv2(container('Please provide both a trigger and a response.', { title: 'Auto Respond', color: 'error' })) as any);
    }

    try {
      await client.db.autoRespond.upsert({
        where: { guildId_trigger: { guildId: context.guildId!, trigger: trigger.toLowerCase() } },
        update: { response },
        create: { guildId: context.guildId!, trigger: trigger.toLowerCase(), response }
      });
      await reply(cv2(container(`Successfully added auto-response for \`${trigger}\` ➔ ${response}`, { title: 'Creo Auto-Respond', color: 'success' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`Failed to add auto-response: ${e.message}`, { title: 'Auto Respond', color: 'error' })) as any);
    }
  },

  async removeRespond(client: CreoClient, context: any, trigger: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    if (!trigger) {
      return reply(cv2(container('Please provide a trigger to remove.', { title: 'Auto Respond', color: 'error' })) as any);
    }

    try {
      await client.db.autoRespond.delete({
        where: { guildId_trigger: { guildId: context.guildId!, trigger: trigger.toLowerCase() } }
      });
      await reply(cv2(container(`Successfully removed auto-response for \`${trigger}\`.`, { title: 'Creo Auto-Respond', color: 'success' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`No auto-response found for \`${trigger}\`.`, { title: 'Auto Respond', color: 'error' })) as any);
    }
  },

  async listRespond(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    const responds = await client.db.autoRespond.findMany({ where: { guildId: context.guildId! } });
    if (responds.length === 0) {
      return reply(cv2(container('No auto-responses are currently set up in this server.', { title: 'Creo Auto-Respond', color: 'default' })) as any);
    }

    const content = responds.map(r => `\`${r.trigger}\` ➔ ${r.response}`).join('\n');
    await reply(cv2(container(content, { title: 'Auto-Responses', color: 'default' })) as any);
  }
};
