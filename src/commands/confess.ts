/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType, ComponentType, PermissionFlagsBits } from "discord.js";
import { encrypt } from "../utils/encryptor";
import { Blocks, Confessions, Configs } from "../database/database";
import { ChatInputCommand, CommandCancelCodes } from "../types/interfaces";
import { createConfessionEmbed } from "../utils/embedCreators";
import {
  createConfirmationButtons,
  disableButtons,
} from "../utils/buttonCreators";

const buttons = createConfirmationButtons("yessend", "nocancel");

export default class Confess
  extends SlashCommandBuilder
  implements ChatInputCommand<"cached">
{
  name = "confess";
  description = "Create a confession.";

  execute: ChatInputCommand<"cached">["execute"] = async (interaction) => {
    const serverConfig = await Configs.findByPk(interaction.guildId);
    const confessChannelId = serverConfig?.confessChannelId;
    if (!confessChannelId)
      return interaction.editReply({
        content: `A confessions channel has not been setup. Please ask an administrator to run the command /config.`,
      });
    else {
      const confessChannel = await interaction.guild.channels
        .fetch(confessChannelId, {
          cache: true,
          force: false,
        })
        .catch(async (e) => {
          await interaction.editReply({
            content: `There seems to have been an error in getting the confessions channel. Please contact server administrators and request them to check the bot configuration.`,
          });
          return console.error(e);
        });
      if (!confessChannel)
        return interaction.editReply({
          content: `Please ask the admins of this server to setup a confessions channel using /config.`,
        });
      if (confessChannel.type !== ChannelType.GuildText)
        return interaction.editReply({
          content: `Please ask the admins of this server to setup a confessions channel correctly, as it seems that the channel being used is not a text channel, using /config.`,
        });
      const confession = interaction.options.getString("confession", true);
      const embed = createConfessionEmbed({
        interaction,
        type: "Confession",
        anonymous: interaction.options.getString("type", true) as
          | "anonymous"
          | "signed",
        confession,
      });

      const reply = await interaction.editReply({
        content: `You are about to send this confession ${
          interaction.options.getString("type", true) === "anonymous"
            ? `anonymously`
            : `with your signature`
        }. Send it?`,
        embeds: [embed],
        components: buttons,
      });
      const button = await reply
        .awaitMessageComponent({
          componentType: ComponentType.Button,
        })
        .catch(async (e) => {
          if (e.code === "INTERACTION_COLLECTOR_ERROR")
            await interaction.editReply({
              content: `Did not click buttons in time.`,
              components: disableButtons(reply),
            });
          else console.error(e);
          return;
        });
      if (button) {
        await button.deferUpdate();
        if (button.customId === "yessend") {
          const confessionMessage = await confessChannel.send({
            embeds: [embed],
          });

          const storedConfession = await Confessions.create({
            messageId: encrypt(confessionMessage.id),
            guildId: interaction.guildId,
            channelId: confessionMessage.channelId,
            userId: interaction.user.id,
          });
          await button.editReply({
            content: `The confession has been [sent successfully](${
              confessionMessage.url
            }) with the ID ${storedConfession.messageId}! Please reach out ${
              serverConfig.helpChannelId
                ? `to staff in <#${serverConfig.helpChannelId}>`
                : `to staff`
            } if you need help.`,
            components: disableButtons(reply),
          });
        } else if (button.customId === "nocancel") {
          await button.editReply({
            content: `Cancelled!`,
            components: disableButtons(reply),
          });
        }
      }
    }
  };

  onBefore: ChatInputCommand<"cached">["onBefore"] = async (interaction) => {
    const block = await Blocks.findByPk(interaction.user.id);
    if (!block || block.type === "unblock")
      return {
        code: CommandCancelCodes.Success,
        processedInteraction: interaction,
      };
    else
      return {
        code: CommandCancelCodes.MissingPermissions,
        processedInteraction: interaction,
      };
  };
  onCancel: ChatInputCommand<"cached">["onCancel"] = async (interaction) => {
    const helpChannelId = (await Configs.findByPk(interaction.guildId))
      ?.helpChannelId;
    if (!helpChannelId)
      return interaction.editReply({
        content: `It seems that you have been blocked from making confessions on this server by the server staff. Please reach out to them to get yourself unblocked.`,
      });
    else
      return interaction.editReply({
        content: `It seems that you have been blocked from making confessions on this server by the server staff. Please reach out to them through <#${helpChannelId}> to get yourself unblocked.`,
      });
  };

  isGuildCommand: ChatInputCommand<"cached">["isGuildCommand"] = () => {
    return !this.dm_permission;
  };

  isDMCommand: ChatInputCommand["isDMCommand"] = () => {
    return this.dm_permission;
  };

  isSubCommandParent: ChatInputCommand<"cached">["isSubCommandParent"] = () => {
    return false;
  };

  isAutocompleteCommand: ChatInputCommand<"cached">["isAutocompleteCommand"] =
    () => {
      return false;
    };

  constructor() {
    super();
    this.setName(this.name);
    this.setDescription(this.description);
    this.addStringOption((o) =>
      o
        .setName("confession")
        .setDescription("The confession you wish to send.")
        .setRequired(true)
    );
    this.addStringOption((o) =>
      o
        .setName("type")
        .setDescription("Type of confession, whether anonymous or signed.")
        .addChoices(
          { name: "Anonymous", value: "anonymous" },
          { name: "Signed", value: "signed" }
        )
        .setRequired(true)
    );
    this.setDMPermission(false);
    this.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);
  }
}
