import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags } from 'discord.js';
import { CreoClient } from '../../bot';
import { error, cv2 } from '../../ui/containers';
import emojis from '../../utils/emojis';

const gifs = [
  'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
  'https://media.giphy.com/media/FqWAhOooPEnzG/giphy.gif',
  'https://media.giphy.com/media/nyGFcsP0kAobm/giphy.gif'
];

export default {
  data: new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Give someone a sweet kiss!')
    .addUserOption(o => o.setName('user').setDescription('The user to kiss').setRequired(true)),
  aliases: ['kiss'],
  category: 'fun',

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply(cv2(error('You need to mention someone to kiss!')) as any);
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
      return reply(cv2(error('You cannot kiss yourself! 🥺')) as any);
    }

    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    
    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> **<@${author.id}> kisses <@${target.id}>! So romantic... 💋**`))
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
