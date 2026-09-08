import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags } from 'discord.js';
import { CreoClient } from '../../bot';
import { error, cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';

const gifs = [
  'https://media.giphy.com/media/Gf3AUz3eA4Hs3y/giphy.gif',
  'https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif',
  'https://media.giphy.com/media/tX29X2Dx3sAXS/giphy.gif'
];

export default {
  data: new SlashCommandBuilder()
    .setName('slap')
    .setDescription('Give someone a tight slap!')
    .addUserOption(o => o.setName('user').setDescription('The user to slap').setRequired(true)),
  aliases: ['slap'],
  category: 'fun',

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply(cv2(error('You need to mention someone to slap!')) as any);
    }
    
    await this.handleAction(message, message.author, target);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const target = interaction.options.getUser('user', true);
    await this.handleAction(interaction, interaction.user, target);
  },

  async handleAction(context: any, author: any, target: any) {
    const isInteraction = !!context.isCommand;
    const reply = (content: any) => isInteraction ? context.reply(content) : context.reply(content);

    if (author.id === target.id) {
      return reply(cv2(error('Why would you slap yourself? Please do not! 🛑')) as any);
    }

    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    
    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> **<@${author.id}> just slapped <@${target.id}>! Ouch... 💥**`))
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(randomGif)
        )
      );

    await reply({
      components: [container],
      flags: (MessageFlags as any).IsComponentsV2
    });
  }
};
