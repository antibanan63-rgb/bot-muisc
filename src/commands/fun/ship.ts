import { SlashCommandBuilder, ChatInputCommandInteraction, User, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import { CreoClient } from '../../bot';
import { container, error, cv2 } from '../../ui/containers';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { join } from 'path';
import { existsSync } from 'fs';
import emojis from '../../utils/emojis';


export default {
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Calculate the shipping compatibility between two users!')
    .addUserOption(o => o.setName('user1').setDescription('First user').setRequired(true))
    .addUserOption(o => o.setName('user2').setDescription('Second user (optional)').setRequired(false)),
  category: 'fun',
  aliases: ['ship'],

  async prefixExecute(client: CreoClient, message: any, args: string[]) {
    let user1 = message.mentions.users.first();
    let user2 = message.mentions.users.size > 1 ? Array.from(message.mentions.users.values())[1] : null;

    if (!user1 && args.length > 0) {
      user1 = await client.users.fetch(args[0].replace(/[<@!>]/g, '')).catch(() => null);
    }
    if (!user2 && args.length > 1) {
      user2 = await client.users.fetch(args[1].replace(/[<@!>]/g, '')).catch(() => null);
    }

    if (!user1) user1 = message.author;
    if (!user2 && user1) {
      user2 = user1;
      user1 = message.author;
    }

    await this.handleAction(client, message, user1, user2 || message.author);
  },

  async execute(interaction: ChatInputCommandInteraction, client: CreoClient) {
    const user1 = interaction.options.getUser('user1', true);
    const user2 = interaction.options.getUser('user2') || interaction.user;

    await this.handleAction(client, interaction, user1, user2);
  },

  async handleAction(client: CreoClient, context: any, u1: User, u2: User) {
    const isInteraction = !!context.isCommand;
    let processingMessage: Message | null = null;

    if (isInteraction) {
      if (!context.deferred && !context.replied) {
        await context.deferReply();
      }
    } else {
      processingMessage = await context.reply(`${emojis.general.loading} Calculating compatibility...`);
    }

    try {
      const baseImagePath = join(process.cwd(), 'assets', 'ship.png');
      if (!existsSync(baseImagePath)) {
        const msg = cv2(container('Ship template not found. Please make sure `assets/ship.png` exists.', { title: 'Creo Fun', color: 'error' }));
        if (isInteraction) return context.followUp(msg);
        if (processingMessage) await processingMessage.delete().catch(() => {});
        return context.reply(msg);
      }

      const baseImage = await loadImage(baseImagePath);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(baseImage, 0, 0);

      const av1Url = u1.displayAvatarURL({ extension: 'png', size: 512 });
      const av2Url = u2.displayAvatarURL({ extension: 'png', size: 512 });

      const [av1, av2] = await Promise.all([
        loadImage(av1Url).catch(() => null),
        loadImage(av2Url).catch(() => null)
      ]);

      if (!av1 || !av2) {
        const msg = cv2(container('Failed to download avatars.', { title: 'Creo Fun', color: 'error' }));
        if (isInteraction) return context.followUp(msg);
        if (processingMessage) await processingMessage.delete().catch(() => {});
        return context.reply(msg);
      }

      const avatarSize = Math.floor(baseImage.height * 0.70);
      const leftX = Math.floor(baseImage.width * 0.20) - (avatarSize / 2);
      const rightX = Math.floor(baseImage.width * 0.80) - (avatarSize / 2);
      const yCenter = Math.floor(baseImage.height * 0.46) - (avatarSize / 2);


            ctx.save();
      ctx.beginPath();
      ctx.arc(leftX + avatarSize / 2, yCenter + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av1, leftX, yCenter, avatarSize, avatarSize);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(rightX + avatarSize / 2, yCenter + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av2, rightX, yCenter, avatarSize, avatarSize);
      ctx.restore();

      const combinedId = `${u1.id}${u2.id}`;
      let hash = 0;
      for (let i = 0; i < combinedId.length; i++) hash = Math.imul(31, hash) + combinedId.charCodeAt(i) | 0;
      const percent = Math.abs(hash) % 101;

      let status = "No Hope";
      if (percent > 90) status = "Perfect Match";
      else if (percent > 75) status = "True Love";
      else if (percent > 55) status = "Great Pair";
      else if (percent > 35) status = "Could Work";

      const cx = baseImage.width / 2;
      ctx.fillStyle = '#ff1493';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';


            ctx.font = `bold ${Math.floor(baseImage.height * 0.32)}px Arial, sans-serif`;
      ctx.fillText(`${percent}%`, cx, Math.floor(baseImage.height * 0.50));


            ctx.font = `bold ${Math.floor(baseImage.height * 0.12)}px Arial, sans-serif`;
      ctx.fillText(status, cx, Math.floor(baseImage.height * 0.89));

      const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'ship.png' });
      const authorId = context.user?.id || context.author?.id;

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`CreoX:ship_random:${context.guildId}:${authorId}`)
          .setLabel('🎲 Ship Random')
          .setStyle(ButtonStyle.Secondary)
      );

      const content = `**${u1.displayName} 💘 ${u2.displayName}**`;

      if (isInteraction) {
        await context.editReply({ content, files: [attachment], components: [row] });
      } else {
        if (processingMessage) await processingMessage.delete().catch(() => { });
        await context.reply({ content, files: [attachment], components: [row] });
      }
    } catch (e) {
      console.error('Ship command error:', e);
      const msg = cv2(container('Something went wrong generating the ship card.', { title: 'Creo Fun', color: 'error' }));
      if (isInteraction) {
        if (context.deferred || context.replied) {
          await context.editReply(msg).catch(() => {});
        } else {
          await context.reply(msg).catch(() => {});
        }
      } else {
        if (processingMessage) await processingMessage.delete().catch(() => {});
        await context.reply(msg).catch(() => {});
      }
    }
  }
};
