import { Client } from 'discord.js';

export async function setVoiceChannelStatus(client: Client, channelId: string, statusText: string) {
  try {
    await client.rest.put(`/channels/${channelId}/voice-status` as any, {
      body: {
        status: statusText.substring(0, 500) // Discord limit is 500 characters
      }
    });
  } catch (err) {
    // Ignore permissions or missing channel errors
  }
}

export async function clearVoiceChannelStatus(client: Client, channelId: string) {
  try {
    await client.rest.put(`/channels/${channelId}/voice-status` as any, {
      body: {
        status: ''
      }
    });
  } catch (err) {
    // Ignore errors
  }
}
