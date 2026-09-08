import { WebhookClient, Guild, User, MessageFlags, EmbedBuilder } from 'discord.js';
import { container } from '../ui/containers';
import emojis from './emojis';

async function sendToWebhook(url: string | undefined, payload: any) {
  if (!url) return;
  try {
    const webhook = new WebhookClient({ url });
    await webhook.send(payload);
  } catch (error) {
    console.error('[Logger] Failed to send webhook:', error);
  }
}

export const Logger = {
  logError: async (error: Error, context?: string) => {
    const title = 'System Error';
    const content = `An error occurred in the system.\n\n${emojis.general.dot} **Context:** \`${context || 'Uncaught Exception / Unhandled Rejection'}\`\n${emojis.general.dot} **Error Name:** \`${error.name}\`\n\`\`\`js\n${error.stack?.substring(0, 1000) || error.message}\n\`\`\``;
    
    const embed = new EmbedBuilder().setTitle(title).setDescription(content).setColor('#f04747');
    
    await sendToWebhook(process.env.WEBHOOK_ERROR, {
      username: 'System Logger',
      embeds: [embed]
    });
  },

  logGuild: async (guild: Guild, action: 'JOIN' | 'LEAVE') => {
    const title = action === 'JOIN' ? 'Joined Guild' : 'Left Guild';
    const color = action === 'JOIN' ? '#43b581' : '#f04747';
    const owner = await guild.fetchOwner().catch(() => null);
    
    const content = `The bot has ${action === 'JOIN' ? 'joined a new' : 'been removed from a'} server.\n\n${emojis.general.dot} **Server Name:** \`${guild.name}\`\n${emojis.general.dot} **Server ID:** \`${guild.id}\`\n${emojis.general.dot} **Member Count:** \`${guild.memberCount}\`\n${emojis.general.dot} **Owner:** \`${owner?.user.tag || 'Unknown'}\` (\`${guild.ownerId}\`)`;
    
    const embed = new EmbedBuilder().setTitle(title).setDescription(content).setColor(color);
    if (guild.iconURL()) embed.setThumbnail(guild.iconURL());
    
    await sendToWebhook(process.env.WEBHOOK_GUILD, {
      username: 'Guild Logger',
      embeds: [embed]
    });
  },

  logCommand: async (user: User, guild: Guild | null, commandName: string, type: 'Slash' | 'Prefix') => {
    const content = `A command was executed.\n\n${emojis.general.dot} **Command:** \`${commandName}\` (${type})\n${emojis.general.dot} **User:** \`${user.tag}\` (\`${user.id}\`)\n${emojis.general.dot} **Server:** \`${guild?.name || 'Direct Message'}\` (\`${guild?.id || 'N/A'}\`)`;
    
    const embed = new EmbedBuilder().setTitle('Command Executed').setDescription(content).setColor('#7289da').setThumbnail(user.displayAvatarURL());
    
    await sendToWebhook(process.env.WEBHOOK_COMMAND, {
      username: 'Command Logger',
      embeds: [embed]
    });
  },

  logNP: async (action: string, user: User, details: string) => {
    const content = `No-Prefix update detected.\n\n${emojis.general.dot} **Action:** \`${action}\`\n${emojis.general.dot} **Target User:** \`${user.tag}\` (\`${user.id}\`)\n\n**Details:**\n> ${details}`;
    
    const embed = new EmbedBuilder().setTitle('No Prefix Log').setDescription(content).setColor('#f1c40f').setThumbnail(user.displayAvatarURL());
    
    await sendToWebhook(process.env.WEBHOOK_NP, {
      username: 'NP Logger',
      embeds: [embed]
    });
  },

  logPremium: async (action: string, user: User, details: string) => {
    const content = `Premium subscription update.\n\n${emojis.general.dot} **Action:** \`${action}\`\n${emojis.general.dot} **User:** \`${user.tag}\` (\`${user.id}\`)\n\n**Details:**\n> ${details}`;
    
    const embed = new EmbedBuilder().setTitle('Premium Log').setDescription(content).setColor('#f1c40f').setThumbnail(user.displayAvatarURL());
    
    await sendToWebhook(process.env.WEBHOOK_PREMIUM, {
      username: 'Premium Logger',
      embeds: [embed]
    });
  }
};
