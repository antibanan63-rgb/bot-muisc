import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CreoClient } from '../../bot';
import { cv2, container, ephemeralCV2, error, success } from '../../ui/containers';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Change the volume')
    .addIntegerOption(o => o.setName('amount').setDescription('Volume percentage').setRequired(false)),
  aliases: ['v', 'vol'],
  category: 'music',

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const player = client.music.players.get(message.guildId!);
    if (!player) return message.reply(cv2(error('Nothing playing.')) as any);

    if (!args[0] || isNaN(parseInt(args[0]))) {
      let prefix = process.env.PREFIX || '$';
      try {
        const gConf = await client.db.guildConfig.findUnique({ where: { guildId: message.guildId! } });
        if (gConf && gConf.prefix) prefix = gConf.prefix;
      } catch {}
      return message.reply(cv2(error(`Current volume is **${player.volume}%**.\nTo change it, provide a value (e.g. \`${prefix}volume 100\`).`)) as any);
    }

    const vol = parseInt(args[0]);

    if (vol < 1 || vol > 150) {
      return message.reply(cv2(error('Volume must be between 1 and 150.')) as any);
    }

    player.setVolume(vol);
    await message.reply(cv2(success(`Volume set to **${vol}%**`)) as any);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const player = client.music.players.get(interaction.guildId!);
    if (!player) return interaction.reply(ephemeralCV2(error('Nothing playing.')) as any);

    const vol = interaction.options.getInteger('amount');

    if (vol === null || isNaN(vol)) {
      return interaction.reply(ephemeralCV2(error(`Current volume is **${player.volume}%**.\nTo change it, provide a value (e.g. \`/volume 100\`).`)) as any);
    }

    if (vol < 1 || vol > 150) {
      return interaction.reply(ephemeralCV2(error('Volume must be between 1 and 150.')) as any);
    }

    player.setVolume(vol);
    await interaction.reply(cv2(success(`Volume set to **${vol}%**`)) as any);
  }
};
