import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, ChannelType, VoiceChannel } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, cv2 } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('247')
    .setDescription('Manage 24/7 Voice Channel mode (Premium Only).')
    .addSubcommand(s => s.setName('activate').setDescription('Activate 24/7 mode in your current voice channel'))
    .addSubcommand(s => s.setName('deactivate').setDescription('Deactivate 24/7 mode for this server'))
    .addSubcommand(s => s.setName('list').setDescription('List all active 24/7 channels (Bot Admin Only)'))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a 24/7 channel globally (Bot Admin Only)').addStringOption(o => o.setName('channel_id').setDescription('Channel ID').setRequired(true))),
  category: 'premium',
  aliases: ['247', '24/7'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'activate') {
      await this.activate(client, message);
    } else if (sub === 'deactivate') {
      await this.deactivate(client, message);
    } else if (sub === 'list') {
      await this.list(client, message);
    } else if (sub === 'remove') {
      await this.remove(client, message, args[1]);
    } else {
      let prefix = process.env.PREFIX || '$';
      try {
        const gConf = await client.db.guildConfig.findUnique({ where: { guildId: message.guildId! } });
        if (gConf && gConf.prefix) prefix = gConf.prefix;
      } catch {}
      await message.reply(cv2(container(`Usage: \`${prefix}247 activate\` or \`${prefix}247 deactivate\``, { title: 'Creo Premium', color: 'default' })) as any);
    }
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'activate') {
      await this.activate(client, interaction);
    } else if (sub === 'deactivate') {
      await this.deactivate(client, interaction);
    } else if (sub === 'list') {
      await this.list(client, interaction);
    } else if (sub === 'remove') {
      await this.remove(client, interaction, interaction.options.getString('channel_id', true));
    }
  },

  async activate(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    const isPremium = await client.db.premiumUser.findUnique({ where: { userId: authorId } });
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!isPremium && !ownerIds.includes(authorId)) {
      return reply(cv2(container('This command is exclusively for Premium Users.', { title: 'Creo Premium', color: 'error' })) as any);
    }

    

    const member = context.member || await context.guild.members.fetch(authorId).catch(() => null);
    if (!member || !member.voice.channel) {
      return reply(cv2(container('You must be in a voice channel to activate 24/7 mode.', { title: 'Creo 24/7', color: 'error' })) as any);
    }

    const channel = member.voice.channel as VoiceChannel;

    try {
      await client.db.vc247.upsert({
        where: { guildId: context.guildId! },
        update: { channelId: channel.id },
        create: { guildId: context.guildId!, channelId: channel.id }
      });


            const player = await client.music.createPlayer({
        guildId: context.guildId!,
        textId: context.channelId,
        voiceId: channel.id,
        deaf: true,
        shardId: context.guild.shardId
      });

      await reply(cv2(container(`24/7 mode activated in **${channel.name}**. The bot will stay in this channel permanently.`, { title: 'Creo 24/7', color: 'success' })) as any);
    } catch (e: any) {
      await reply(cv2(container(`Failed to join voice channel: \`${e.message}\``, { title: 'Creo 24/7', color: 'error' })) as any);
    }
  },

  async deactivate(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    const isPremium = await client.db.premiumUser.findUnique({ where: { userId: authorId } });
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!isPremium && !ownerIds.includes(authorId)) {
      return reply(cv2(container('This command is exclusively for Premium Users.', { title: 'Creo Premium', color: 'error' })) as any);
    }

    

    const data = await client.db.vc247.findUnique({ where: { guildId: context.guildId! } });
    if (!data) {
      return reply(cv2(container('24/7 mode is not active in this server.', { title: 'Creo 24/7', color: 'error' })) as any);
    }

    await client.db.vc247.delete({ where: { guildId: context.guildId! } });

    const player = client.music.players.get(context.guildId!);
    if (player) {
      player.destroy();
    }

    await reply(cv2(container('24/7 mode deactivated. The bot has left the voice channel.', { title: 'Creo 24/7', color: 'success' })) as any);
  },

  async list(client: CreoClient, context: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    const isAdmin = await client.db.adminUser.findUnique({ where: { userId: authorId } });
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!isAdmin && !ownerIds.includes(authorId)) {
      return reply(cv2(container('This command is exclusively for Bot Admins and the Bot Owner.', { title: 'Creo 24/7', color: 'error' })) as any);
    }

    const vcs = await client.db.vc247.findMany();
    if (vcs.length === 0) {
      return reply(cv2(container('No active 24/7 channels found.', { title: 'Creo 24/7', color: 'error' })) as any);
    }

    const content = vcs.map(v => `• <#${v.channelId}> in Guild \`${v.guildId}\``).join('\n');
    await reply(cv2(container(content, { title: 'Active 24/7 Channels', color: 'default' })) as any);
  },

  async remove(client: CreoClient, context: any, channelId: string) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);
    const authorId = isInteraction ? context.user.id : context.author.id;

    const isAdmin = await client.db.adminUser.findUnique({ where: { userId: authorId } });
    const ownerIds = process.env.OWNER_ID?.split(',').map(id => id.trim()) || [];
    if (!isAdmin && !ownerIds.includes(authorId)) {
      return reply(cv2(container('This command is exclusively for Bot Admins and the Bot Owner.', { title: 'Creo 24/7', color: 'error' })) as any);
    }

    const vc = await client.db.vc247.findFirst({ where: { channelId } });
    if (!vc) {
      return reply(cv2(container('That channel ID is not in the active 24/7 list.', { title: 'Creo 24/7', color: 'error' })) as any);
    }

    await client.db.vc247.delete({ where: { guildId: vc.guildId } });

    const player = client.music.players.get(vc.guildId);
    if (player) {
      player.destroy();
    }

    await reply(cv2(container(`Removed 24/7 mode from DB and disconnected channel \`${channelId}\`.`, { title: 'Creo 24/7', color: 'success' })) as any);
  }
};

