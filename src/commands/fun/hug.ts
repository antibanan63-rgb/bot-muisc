import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags } from 'discord.js';
import { CreoClient } from '../../bot';
import { error, cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';

const gifs = [
  'https://media.giphy.com/media/lrr9cScdxK0j6/giphy.gif',
  'https://media.giphy.com/media/od5H3PmEG5BGq/giphy.gif',
  'https://media.giphy.com/media/wnsgren9NtITS/giphy.gif'
];

export default {
  data: new SlashCommandBuilder()
    .setName('hug')
    .setDescription('Give someone a warm hug!')
    .addUserOption(o => o.setName('user').setDescription('The user to hug').setRequired(true)),
  aliases: ['hug'],
  category: 'fun',

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply(cv2(error('You need to mention someone to hug!')) as any);
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
      return reply(cv2(error('You cannot hug yourself, but we send you virtual hugs! 🫂')) as any);
    }

    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    
    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> **<@${author.id}> hugs <@${target.id}>! Awww... ❤️**`))
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
