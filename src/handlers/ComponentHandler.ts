import { EFFECTS, COLORS, buildNameplateUI } from '../commands/premium/bnameplate';
import { buildGlobalNameplateUI } from '../commands/owner/gnameplate';
import { Logger } from '../utils/logger';
import {
  ButtonInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalActionRowComponentBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  TextDisplayBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ContainerBuilder
} from 'discord.js';
import { CreoClient } from '../bot';
import { inSameVoiceChannel } from '../utils/checks';
import { error, success, ephemeralCV2, cv2, container } from '../ui/containers';
import { buildHelpMenu } from '../ui/helpMenu';
import { buildPlayerUI } from '../ui/playerEmbed';
import chalk from 'chalk';
import emojis from '../utils/emojis';

export class ComponentHandler {
  constructor(private client: CreoClient) { }

  public async load() {
    return 'Component routing initialized.';
  }

  public async handleButton(interaction: ButtonInteraction) {
    const customPrefix = 'CreoX';
    if (!interaction.customId.startsWith(`${customPrefix}:`)) return;

    try {
      const parts = interaction.customId.split(':');
      const action = parts[1];

      if (action === 'np' || action === 'gnp') {
        const subAction = parts[2];
        const fontId = parseInt(parts[3]);
        const effectId = parseInt(parts[4]);
        const colorId = parseInt(parts[5]);
        const callerId = parts[6];

        if (interaction.user.id !== callerId) {
          return interaction.reply(ephemeralCV2(container('Only the command author can interact with this menu.', { title: 'Nameplate Customizer', color: 'error' })) as any);
        }

        const isGlobal = action === 'gnp';
        const buildUI = isGlobal ? buildGlobalNameplateUI : buildNameplateUI;
        const cachePrefix = isGlobal ? 'GLOBAL' : interaction.guildId;

        if (subAction === 'font_menu') {
          const ui = await buildUI(this.client, fontId, effectId, colorId, callerId, 'font', interaction.guildId || undefined);
          await interaction.update(cv2(ui) as any);
        } else if (subAction === 'style_menu') {
          const ui = await buildUI(this.client, fontId, effectId, colorId, callerId, 'style', interaction.guildId || undefined);
          await interaction.update(cv2(ui) as any);
        } else if (subAction === 'color_menu') {
          const ui = await buildUI(this.client, fontId, effectId, colorId, callerId, 'color', interaction.guildId || undefined);
          await interaction.update(cv2(ui) as any);
        } else if (subAction === 'main') {
          const ui = await buildUI(this.client, fontId, effectId, colorId, callerId, 'main', interaction.guildId || undefined);
          await interaction.update(cv2(ui) as any);
        } else if (subAction === 'save') {
          await interaction.deferUpdate();
          try {
            let colors: number[] = [];
            if (colorId === 999) {
              const cached = (this.client as any).nameplateCache?.get(`${cachePrefix}-${callerId}`);
              if (cached?.decColors && cached.decColors.length > 0) {
                colors = cached.decColors;
              } else {
                await interaction.followUp(ephemeralCV2(error("You selected a custom color but didn't configure it. Please choose and configure a custom color first!")) as any);
                return;
              }
            } else {
              const colorInfo = COLORS[colorId] || COLORS[9];
              colors = colorInfo.colors;
            }

            const effectInfo = EFFECTS[effectId] || EFFECTS[1];

            if (effectInfo.id === 2) {
              if (colors.length === 1) {
                colors = [colors[0], colors[0]];
              } else if (colors.length !== 2) {
                await interaction.followUp(ephemeralCV2(error("Gradient effect requires exactly 2 colors. Please configure a custom gradient color!")) as any);
                return;
              }
            } else {
              if (colors.length > 1) {
                colors = [colors[0]];
              } else if (colors.length === 0) {
                colors = [16777215];
              }
            }

            if (isGlobal) {
              const guilds = Array.from(this.client.guilds.cache.values()) as any[];
              let updatedCount = 0;
              let skippedCount = 0;

              for (const guild of guilds) {
                try {
                  const config = await this.client.db.guildConfig.findUnique({ where: { guildId: guild.id } });
                  const isCustomized = config && !(config.nameplateFontId === 11 && config.nameplateEffectId === 1 && config.nameplateColors === "16777215");
                  
                  if (isCustomized) {
                    skippedCount++;
                    continue;
                  }

                  await this.client.rest.patch(`/guilds/${guild.id}/members/@me` as any, {
                    body: {
                      display_name_font_id: fontId,
                      display_name_effect_id: effectInfo.id,
                      display_name_colors: colors
                    }
                  });
                  updatedCount++;
                } catch (e) {
                 
                }
              }

              await interaction.followUp(ephemeralCV2(success(`Global update complete!\nUpdated **${updatedCount}** servers.\nSkipped **${skippedCount}** customized servers.`)) as any);
            } else {
              await this.client.rest.patch(`/guilds/${interaction.guildId}/members/@me` as any, {
                body: {
                  display_name_font_id: fontId,
                  display_name_effect_id: effectInfo.id,
                  display_name_colors: colors
                }
              });

              const colorsString = colors.join(',');
              const hexString = colors.map((dec: number) => '#' + dec.toString(16).padStart(6, '0').toUpperCase()).join(',');

              await this.client.db.guildConfig.upsert({
                where: { guildId: interaction.guildId! },
                update: {
                  nameplateFontId: fontId,
                  nameplateEffectId: effectInfo.id,
                  nameplateColors: colorsString,
                  nameplateHex: hexString
                },
                create: {
                  guildId: interaction.guildId!,
                  nameplateFontId: fontId,
                  nameplateEffectId: effectInfo.id,
                  nameplateColors: colorsString,
                  nameplateHex: hexString
                }
              });

              await interaction.followUp(ephemeralCV2(success("Successfully updated and saved the bot's server display style!")) as any);
            }
          } catch (err: any) {
            await interaction.followUp(ephemeralCV2(error(`Failed to update display style: ${err.message || err}`)) as any);
          }
        } else if (subAction === 'reset') {
          await interaction.deferUpdate();
          try {
            if (isGlobal) {
              const guilds = Array.from(this.client.guilds.cache.values()) as any[];
              let updatedCount = 0;
              let skippedCount = 0;

              for (const guild of guilds) {
                try {
                  const config = await this.client.db.guildConfig.findUnique({ where: { guildId: guild.id } });
                  const isCustomized = config && !(config.nameplateFontId === 11 && config.nameplateEffectId === 1 && config.nameplateColors === "16777215");
                  
                  if (isCustomized) {
                    skippedCount++;
                    continue;
                  }

                  await this.client.rest.patch(`/guilds/${guild.id}/members/@me` as any, {
                    body: {
                      display_name_font_id: null,
                      display_name_effect_id: null,
                      display_name_colors: null
                    }
                  });
                  updatedCount++;
                } catch (e) {
                }
              }

              if ((this.client as any).nameplateCache) {
                (this.client as any).nameplateCache.delete(`GLOBAL-${callerId}`);
              }

              await interaction.followUp(ephemeralCV2(success(`Global reset complete!\nReset **${updatedCount}** servers.\nSkipped **${skippedCount}** customized servers.`)) as any);
            } else {
              await this.client.rest.patch(`/guilds/${interaction.guildId}/members/@me` as any, {
                body: {
                  display_name_font_id: null,
                  display_name_effect_id: null,
                  display_name_colors: null
                }
              });

              await this.client.db.guildConfig.upsert({
                where: { guildId: interaction.guildId! },
                update: {
                  nameplateFontId: 11,
                  nameplateEffectId: 1,
                  nameplateColors: "16777215",
                  nameplateHex: "#FFFFFF"
                },
                create: {
                  guildId: interaction.guildId!,
                  nameplateFontId: 11,
                  nameplateEffectId: 1,
                  nameplateColors: "16777215",
                  nameplateHex: "#FFFFFF"
                }
              });

              if ((this.client as any).nameplateCache) {
                (this.client as any).nameplateCache.delete(`${interaction.guildId}-${callerId}`);
              }

              await interaction.followUp(ephemeralCV2(success("Successfully reset the bot's server display style to default!")) as any);
            }
          } catch (err: any) {
            await interaction.followUp(ephemeralCV2(error(`Failed to reset display style: ${err.message || err}`)) as any);
          }
        }
        return;
      }

      if (action === 'help_trigger' || action === 'help') {
        const callerId = parts[3] || parts[2];
        if (callerId && interaction.user.id !== callerId) {
          await interaction.reply(ephemeralCV2(error('Only the user who mentioned the bot can use this button.')) as any);
          return;
        }
        const ui = buildHelpMenu('Home', this.client, interaction.user.id);
        await interaction.update(cv2(ui) as any);
        return;
      }

      const musicActions = ['pause', 'skip', 'prev', 'rewind', 'forward', 'stop', 'loop', 'shuffle', 'autoplay', 'heart'];
      if (musicActions.includes(action) && !inSameVoiceChannel(interaction as any)) {
        await interaction.reply(ephemeralCV2(error('You must be in the same voice channel as me to use this.')) as any);
        return;
      }

      const guildPlayer = this.client.guildPlayers.get(interaction.guildId!);
      if (musicActions.includes(action) && !guildPlayer) {
        await interaction.reply(ephemeralCV2(error('No music is currently playing in this server.')) as any);
        return;
      }

      await interaction.deferUpdate().catch(() => { });

      if (guildPlayer && !guildPlayer.player.queue.current) {
        if (['pause', 'skip', 'prev', 'rewind', 'forward', 'stop', 'loop', 'shuffle', 'autoplay', 'heart'].includes(action)) {
          return;
        }
      }

      switch (action) {
        case 'pause':
          guildPlayer!.player.pause(!guildPlayer!.player.paused);
          break;
        case 'skip':
          try { if (guildPlayer!.player) guildPlayer!.player.skip(); } catch(e){}
          break;
        case 'prev':
          const previous = guildPlayer!.player.getPrevious();
          if (previous) {
            guildPlayer!.player.play(previous);
          } else {
            await interaction.followUp(ephemeralCV2(error('No previous track found.')) as any);
          }
          break;
        case 'rewind':
          guildPlayer!.player.seek(Math.max(0, guildPlayer!.player.position - 10000));
          break;
        case 'forward':
          guildPlayer!.player.seek(guildPlayer!.player.position + 10000);
          break;
        case 'stop': {
          guildPlayer!.isStopped = true;
          const is247 = await this.client.db.vc247.findUnique({ where: { guildId: interaction.guildId! } });
          if (is247) {
            guildPlayer!.player.queue.clear();
            guildPlayer!.player.shoukaku.stopTrack();
            await interaction.followUp(ephemeralCV2(success('Stopped music and cleared queue.')) as any).catch(() => {});
          } else {
            guildPlayer!.player.destroy();
            this.client.guildPlayers.delete(interaction.guildId!);
            await interaction.followUp(ephemeralCV2(success('Stopped music and left channel.')) as any).catch(() => {});
          }
          return;
        }
        case 'loop': {
          let nextLoop = 'none';
          if (guildPlayer!.player.loop === 'none') nextLoop = 'track';
          else if (guildPlayer!.player.loop === 'track') nextLoop = 'queue';
          else nextLoop = 'none';
          guildPlayer!.player.setLoop(nextLoop as any);
          break;
        }
        case 'shuffle':
          guildPlayer!.player.queue.shuffle();
          break;
        case 'autoplay':
          guildPlayer!.autoplay = !guildPlayer!.autoplay;
          break;
        case 'heart': {
          const track = guildPlayer?.player.queue.current;
          if (track) {
            try {
              const existing = await this.client.db.likedTrack.findFirst({
                where: { userId: interaction.user.id, uri: track.uri! }
              });
              if (!existing) {
                await this.client.db.likedTrack.create({
                  data: {
                    userId: interaction.user.id,
                    title: track.title,
                    uri: track.uri!,
                    author: track.author || 'Unknown',
                    duration: track.length || 0,
                    source: track.sourceName || 'unknown'
                  }
                });
              }
            } catch (e) {
              console.error(e);
            }
          }
          await interaction.followUp(ephemeralCV2(success(`Added to your liked songs! ${emojis.music.like}`)) as any);
          return;
        }
        default:
          break;
      }

      if (guildPlayer && guildPlayer.player.queue.current) {
        const loopMode = guildPlayer.player.loop === 'none' ? 0 : guildPlayer.player.loop === 'track' ? 1 : 2;
        const ui = buildPlayerUI(
          guildPlayer.player.guildId,
          guildPlayer.player.queue.current,
          guildPlayer.player.position,
          guildPlayer.player.playing,
          loopMode,
          guildPlayer.player.queue.length,
          guildPlayer.player.volume,
          guildPlayer.autoplay
        );
        if (guildPlayer.playerMessageId) {
          const channel = this.client.channels.cache.get(guildPlayer.textChannelId || guildPlayer.player.textId!) as any;
          if (channel) {
            const msg = await channel.messages.fetch(guildPlayer.playerMessageId).catch(() => null);
            if (msg) {
              const currentUI = cv2(ui) as any;
              await msg.edit(currentUI).catch(() => null);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  public async handleSelectMenu(interaction: StringSelectMenuInteraction) {
    const customPrefix = 'CreoX';
    if (!interaction.customId.startsWith(`${customPrefix}:`)) return;

    try {
      const parts = interaction.customId.split(':');
      const action = parts[1];

      if (action === 'filter_select' || action === 'filterSet') {
        if (!inSameVoiceChannel(interaction as any)) {
          await interaction.reply(ephemeralCV2(error('You must be in the same voice channel as me to use this.')) as any);
          return;
        }

        const guildPlayer = this.client.guildPlayers.get(interaction.guildId!);
        if (!guildPlayer) {
          await interaction.reply(ephemeralCV2(error('No music player is currently active in this server.')) as any);
          return;
        }

        const filter = interaction.values[0];
        guildPlayer.filters.applyPreset(filter);
        await interaction.reply(ephemeralCV2(success(`Filter \`${filter}\` applied.`)) as any);
        return;
      }

      if (action === 'help_select') {
        const callerId = parts[2];
        if (callerId && interaction.user.id !== callerId) {
          await interaction.reply({ content: 'You cannot use this dropdown.', ephemeral: true });
          return;
        }
        const category = interaction.values[0];
        const ui = buildHelpMenu(category, this.client, callerId);
        await interaction.update(cv2(ui) as any);
        return;
      }

      if (action === 'engine_select') {
        const callerId = parts[2];
        if (callerId && interaction.user.id !== callerId) {
          await interaction.reply(ephemeralCV2(error('You cannot use this dropdown.')) as any);
          return;
        }
        const selectedEngine = interaction.values[0];

        await this.client.db.userConfig.upsert({
          where: { userId: callerId },
          update: { searchEngine: selectedEngine },
          create: { userId: callerId, searchEngine: selectedEngine }
        });

        const engines: Record<string, string> = {
          'ytsearch': 'YouTube',
          'spsearch': 'Spotify',
          'scsearch': 'SoundCloud',
          'dzsearch': 'Deezer',
          'jssearch': 'JioSaavn'
        };

        const engineName = engines[selectedEngine] || selectedEngine;
        await interaction.update(cv2(success(`Your default search engine is now set to **${engineName}**.`)) as any);
        return;
      }

      if (action === 'np_duration') {
        const targetUserId = parts[2];
        const days = parseInt(interaction.values[0]);
        let expiresAt: Date | null = null;
        
        if (days > 0) {
          expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        }

        await this.client.db.noPrefixUser.upsert({
          where: { userId: targetUserId },
          update: { expiresAt },
          create: { userId: targetUserId, expiresAt }
        });

        const timeStr = expiresAt ? `until <t:${Math.floor(expiresAt.getTime() / 1000)}:f>` : 'Lifetime';
        
        try {
          const targetUser = await this.client.users.fetch(targetUserId);
          Logger.logNP('Added/Updated', targetUser, `Granted No-Prefix access ${timeStr}`);
        } catch {}

        await interaction.update(cv2(container(`Successfully granted No-Prefix access to <@${targetUserId}> (${timeStr}).`, { title: 'Creo Owner', color: 'success' })) as any);
        return;
      }

      if (action === 'premium_duration') {
        const targetUserId = parts[2];
        const days = parseInt(interaction.values[0]);
        let expiresAt: Date | null = null;
        
        if (days > 0) {
          expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        }

        await this.client.db.premiumUser.upsert({
          where: { userId: targetUserId },
          update: { expiresAt },
          create: { userId: targetUserId, expiresAt }
        });

        const timeStr = expiresAt ? `until <t:${Math.floor(expiresAt.getTime() / 1000)}:f>` : 'Lifetime';
        
        try {
          const targetUser = await this.client.users.fetch(targetUserId);
          Logger.logPremium('Added/Updated', targetUser, `Granted Premium access ${timeStr}`);
        } catch {}

        await interaction.update(cv2(container(`Successfully granted Premium access to <@${targetUserId}> (${timeStr}).`, { title: 'Creo Premium', color: 'success' })) as any);
        return;
      }

      if (action === 'np' || action === 'gnp') {
        const subAction = parts[2];
        const fontId = parseInt(parts[3]);
        const effectId = parseInt(parts[4]);
        const colorId = parseInt(parts[5]);
        const callerId = parts[6];

        if (interaction.user.id !== callerId) {
          return interaction.reply(ephemeralCV2(container('Only the command author can interact with this menu.', { title: 'Nameplate Customizer', color: 'error' })) as any);
        }

        const isGlobal = action === 'gnp';
        const buildUI = isGlobal ? buildGlobalNameplateUI : buildNameplateUI;
        const cachePrefix = isGlobal ? 'GLOBAL' : interaction.guildId;

        if (subAction === 'set_font') {
          const value = parseInt(interaction.values[0]);
          const ui = await buildUI(this.client, value, effectId, colorId, callerId, 'main', interaction.guildId || undefined);
          await interaction.update(cv2(ui) as any);
        } else if (subAction === 'set_style') {
          const value = parseInt(interaction.values[0]);
          if (value !== 2) {
            const cached = (this.client as any).nameplateCache?.get(`${cachePrefix}-${callerId}`);
            if (cached) {
              if (cached.hexColors && cached.hexColors.length > 1) {
                cached.hexColors = [cached.hexColors[0]];
              }
              if (cached.decColors && cached.decColors.length > 1) {
                cached.decColors = [cached.decColors[0]];
              }
            }
          }
          const ui = await buildUI(this.client, fontId, value, colorId, callerId, 'main', interaction.guildId || undefined);
          await interaction.update(cv2(ui) as any);
        } else if (subAction === 'set_color') {
          if (interaction.values[0] === 'custom') {
            const modal = new ModalBuilder()
              .setCustomId(`${customPrefix}:np:modal_submit:${fontId}:${effectId}:999:${callerId}`)
              .setTitle('Custom Color (Hex Code)');

            const textInput1 = new TextInputBuilder()
              .setCustomId('hex_color_1')
              .setLabel(effectId === 2 ? 'First Hex Color (e.g. #FF0000)' : 'Hex Color (e.g. #FF0000)')
              .setPlaceholder('#FF0000')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const rows = [new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textInput1)];

            if (effectId === 2) {
              const textInput2 = new TextInputBuilder()
                .setCustomId('hex_color_2')
                .setLabel('Second Hex Color (e.g. #00FF00)')
                .setPlaceholder('#00FF00')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
              rows.push(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textInput2));
            }

            modal.addComponents(...rows);
            return interaction.showModal(modal);
          } else {
            const value = parseInt(interaction.values[0]);
            const ui = await buildUI(this.client, fontId, effectId, value, callerId, 'main', interaction.guildId || undefined);
            await interaction.update(cv2(ui) as any);
          }
        } else if (subAction === 'set_color_grad1' || subAction === 'set_color_grad2') {
          if (interaction.values[0] === 'custom') {
            const modal = new ModalBuilder()
              .setCustomId(`${customPrefix}:np:modal_submit:${fontId}:${effectId}:999:${callerId}`)
              .setTitle('Custom Color (Hex Code)');

            const textInput1 = new TextInputBuilder()
              .setCustomId('hex_color_1')
              .setLabel('First Hex Color (e.g. #FF0000)')
              .setPlaceholder('#FF0000')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const rows = [new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textInput1)];

            if (effectId === 2) {
              const textInput2 = new TextInputBuilder()
                .setCustomId('hex_color_2')
                .setLabel('Second Hex Color (e.g. #00FF00)')
                .setPlaceholder('#00FF00')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
              rows.push(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textInput2));
            }

            modal.addComponents(...rows);
            return interaction.showModal(modal);
          } else {
            const predefinedId = parseInt(interaction.values[0]);
            const selectedColors = COLORS[predefinedId]?.colors || [16777215];
            const selectedDec = selectedColors[0];
            const selectedHex = '#' + selectedDec.toString(16).padStart(6, '0').toUpperCase();

            if (!(this.client as any).nameplateCache) {
              (this.client as any).nameplateCache = new Map();
            }

            let cached = (this.client as any).nameplateCache.get(`${cachePrefix}-${callerId}`);
            if (!cached) {
              cached = {
                hexColors: ['#FFFFFF', '#FFFFFF'],
                decColors: [16777215, 16777215]
              };
            }

            if (subAction === 'set_color_grad1') {
              cached.decColors[0] = selectedDec;
              cached.hexColors[0] = selectedHex;
            } else {
              cached.decColors[1] = selectedDec;
              cached.hexColors[1] = selectedHex;
            }

            (this.client as any).nameplateCache.set(`${cachePrefix}-${callerId}`, cached);

            const ui = await buildUI(this.client, fontId, effectId, 999, callerId, 'color', interaction.guildId || undefined);
            await interaction.update(cv2(ui) as any);
          }
        }
        return;
      }

      if (action === 'stats_select') {
        const callerId = parts[2];
        if (callerId && interaction.user.id !== callerId) {
          await interaction.reply({ content: 'You cannot use this dropdown.', ephemeral: true });
          return;
        }
        const choice = interaction.values[0];
        let content = '';
        let title = '';
        const dot = emojis.general.dot;
        const footer = `Laira • Made By FeroX Devs`;

        if (choice === 'general') {
          title = `${emojis.general.stats} General Statistics`;
          const uptime = process.uptime();
          const d = Math.floor(uptime / (3600 * 24));
          const h = Math.floor((uptime % (3600 * 24)) / 3600);
          const m = Math.floor((uptime % 3600) / 60);
          const uptimeStr = `${d > 0 ? `${d}d ` : ''}${h > 0 ? `${h}h ` : ''}${m}m`;

          content = `${dot} **Total Guilds:** \`${this.client.guilds.cache.size}\`\n` +
            `${dot} **Total Users:** \`${this.client.guilds.cache.reduce((a: number, b: any) => a + b.memberCount, 0)}\`\n` +
            `${dot} **Shard ID:** \`#${interaction.guild?.shardId ?? 0}\`\n` +
            `${dot} **Uptime:** \`${uptimeStr}\`\n` +
            `${dot} **Gateway Ping:** \`${this.client.ws.ping}ms\``;
        } else if (choice === 'system') {
          title = `${emojis.general.system} System Statistics`;
          const mem = process.memoryUsage();
          content = `${dot} **Node.js Version:** \`${process.version}\`\n` +
            `${dot} **Operating System:** \`Windows 11\`\n` +
            `${dot} **Memory Usage:** \`${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB\`\n` +
            `${dot} **CPU Arch:** \`${process.arch}\``;
        } else if (choice === 'team') {
          title = `${emojis.general.team} Development Team`;
          content = `${dot} **Lead Developer:** \`ferox.dev\`\n` +
            `${dot} **Contributors:** \`ferox_devs_group\`\n` +
            `${dot} **Support Server:** [Click Here](https://discord.gg/ferox-music)`;
        } else if (choice === 'ping') {
          title = `${emojis.general.ping} Latency Statistics`;
          content = `${dot} **Gateway Ping:** \`${this.client.ws.ping}ms\``; // simplified
        } else if (choice === 'music') {
          title = `${emojis.general.music} Music Node Statistics`;
          const node = Array.from(this.client.music.shoukaku.nodes.values())[0];
          const state = node ? (node.state === 1 ? 'Connected' : 'Disconnected') : 'No Node Available';
          const players = node?.stats?.players || 0;
          content = `${dot} **Node Name:** \`${node ? node.name : 'Unknown'}\`\n` +
            `${dot} **Node State:** \`${state}\`\n` +
            `${dot} **Active Players:** \`${players}\``;
        }

        const botName = this.client.user?.username || 'Bot';
        const statsUI = new ContainerBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${title}\n\n${content}\n\n-# ${botName} • Made By FeroX Devs`));

        const select = new StringSelectMenuBuilder()
          .setCustomId(`${customPrefix}:stats_select:${callerId}`)
          .setPlaceholder('Select statistic category...')
          .addOptions([
            { label: "General Stats", description: "Servers, Users, Shards", emoji: emojis.general.stats, value: "general" },
            { label: "Team Info", description: "Owner and Developer info", emoji: emojis.general.team, value: "team" },
            { label: "System Info", description: "DB, RAM, CPU", emoji: emojis.general.system, value: "system" },
            { label: "Ping", description: "Database & Websocket Latency", emoji: emojis.general.ping, value: "ping" },
            { label: "Music Node", description: "Lavalink Node status", emoji: emojis.general.music, value: "music" }
          ]);

        statsUI.addActionRowComponents(new ActionRowBuilder().addComponents(select) as any);
        await interaction.update(cv2(statsUI) as any);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  public async handleModalSubmit(interaction: ModalSubmitInteraction) {
    const customPrefix = 'CreoX';
    if (!interaction.customId.startsWith(`${customPrefix}:`)) return;

    try {
      const parts = interaction.customId.split(':');
      const action = parts[1];

      if (action === 'np' || action === 'gnp') {
        const subAction = parts[2];
        const fontId = parseInt(parts[3]);
        const effectId = parseInt(parts[4]);
        const colorId = parseInt(parts[5]);
        const callerId = parts[6];

        if (interaction.user.id !== callerId) {
          return interaction.reply(ephemeralCV2(container('Only the command author can interact with this menu.', { title: 'Nameplate Customizer', color: 'error' })) as any);
        }

        const isGlobal = action === 'gnp';
        const buildUI = isGlobal ? buildGlobalNameplateUI : buildNameplateUI;
        const cachePrefix = isGlobal ? 'GLOBAL' : interaction.guildId;

        if (subAction === 'modal_submit') {
          const val1 = interaction.fields.getTextInputValue('hex_color_1').trim();
          let val2 = '';
          try {
            val2 = interaction.fields.getTextInputValue('hex_color_2').trim();
          } catch {}

          const parseHex = (hex: string): number | null => {
            const cleaned = hex.replace(/^#/, '');
            if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null;
            return parseInt(cleaned, 16);
          };

          const dec1 = parseHex(val1);
          const dec2 = val2 ? parseHex(val2) : null;

          if (dec1 === null || (effectId === 2 && dec2 === null)) {
            return interaction.reply({
              content: 'Invalid hex color code(s) entered. Please use standard 6-character hex codes (e.g., #FF0000).',
              ephemeral: true
            });
          }

          if (!(this.client as any).nameplateCache) {
            (this.client as any).nameplateCache = new Map();
          }
          const hexColors = [val1];
          const decColors = [dec1];
          if (effectId === 2 && val2 && dec2 !== null) {
            hexColors.push(val2);
            decColors.push(dec2);
          }
          (this.client as any).nameplateCache.set(`${cachePrefix}-${callerId}`, { hexColors, decColors });

          const ui = await buildUI(this.client, fontId, effectId, 999, callerId, 'main', interaction.guildId || undefined);
          if ((interaction as any).update) {
            await (interaction as any).update(cv2(ui) as any);
          } else {
            await interaction.reply(cv2(ui) as any);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}


