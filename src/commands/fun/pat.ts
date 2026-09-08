import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags } from 'discord.js';
import { CreoClient } from '../../bot';
import { error, cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';

const gifs = [
  'https://media.giphy.com/media/L2z7jv113U4s8/giphy.gif',
  'https://media.giphy.com/media/109yvQy53Y6bKw/giphy.gif',
  'https://media.giphy.com/media/osYdfUptPqV0s/giphy.gif'
];

export default {
  data: new SlashCommandBuilder()
    .setName('pat')
    .setDescription('Give someone a head pat!')
    .addUserOption(o => o.setName('user').setDescription('The user to pat').setRequired(true)),
  aliases: ['pat'],
  category: 'fun',

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply(cv2(error('You need to mention someone to pat!')) as any);
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
      return reply(cv2(error('Here, I will pat you instead! *pat pat* 🥺')) as any);
    }

    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    
    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> **<@${author.id}> gently pats <@${target.id}> on the head! Cute... 🥺**`))
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
