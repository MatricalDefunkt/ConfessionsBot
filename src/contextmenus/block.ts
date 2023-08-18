/** @format */

import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { CommandCancelCodes, ContextMenu } from "../types/interfaces";
import {
  ApplicationCommandType,
  ComponentType,
  PermissionFlagsBits,
  TextInputStyle,
} from "discord-api-types/v10";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "discord.js";
import { Blocks, Confessions, Configs } from "../database/database";
import { encrypt } from "../utils/encryptor";
import { createBlockRequestEmbed } from "../utils/embedCreators";
import {
  createConfirmationButtons,
  disableButtons,
} from "../utils/buttonCreators";

const confirmButtons = createConfirmationButtons("block", "cancel");
const disabledConfirmButtons = disableButtons(confirmButtons);

const reasonModal = new ModalBuilder()
  .setCustomId("reasonModal")
  .setTitle("Block Reason:");
const reasonInputComponent = new TextInputBuilder()
  .setStyle(TextInputStyle.Paragraph)
  .setCustomId("reason")
  .setLabel("Reason for blocking. Will be shown to user.")
  .setPlaceholder("Under 512 characters...")
  .setMinLength(16)
  .setMaxLength(512)
  .setRequired(true);
const reasonInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
  reasonInputComponent
);
reasonModal.addComponents(reasonInputRow);

export default class Block
  extends ContextMenuCommandBuilder
  implements ContextMenu
{
  execute: ContextMenu["execute"] = async (interaction) => {
    if (!interaction.isMessageContextMenuCommand()) return;
    const message = interaction.targetMessage;
    if (
      message.author.id == message.client.user?.id &&
      message.embeds.length === 1 &&
      (message.embeds[0].title === "Confession" || "Reply")
    ) {
      const reply = await interaction.editReply({
        embeds: [
          createBlockRequestEmbed({
            interaction,
            messageURL: interaction.targetMessage.url,
          }),
        ],
        components: confirmButtons,
      });
      const button = await reply
        .awaitMessageComponent({
          time: 300_000,
          componentType: ComponentType.Button,
        })
        .catch(async (err) => {
          if (err.code === "INTERACTION_COLLECTOR_ERROR") {
            await interaction.editReply({
              content: `Did not click buttons in time.`,
              components: disabledConfirmButtons,
            });
            return;
          }
        });
      if (button) {
        if (button.customId === "block") {
          const storedConfession = await Confessions.findByPk(
            encrypt(message.id)
          );
          if (!storedConfession) {
            await message.delete();
            return await button.reply({
              content: `There was an error where the confession was not stored properly. Apologies for the inconvinience, but the user cannot be blocked. Regardless, the message has been deleted for now.`,
              ephemeral: true,
            });
          }
          await button.showModal(reasonModal);
          const modalSubmit = await button
            .awaitModalSubmit({
              time: 300_000,
            })
            .catch(async (e) => {
              if (e.code === "INTERACTION_COLLECTOR_ERROR") {
                await button.editReply({
                  content: `You did not submit modal in time. The action has been cancelled.`,
                  components: disabledConfirmButtons,
                });
                return;
              } else console.error(e);
            });
          if (modalSubmit) {
            if (!modalSubmit.isFromMessage()) return;
            await modalSubmit.deferUpdate();

            const reason = modalSubmit.fields.getTextInputValue("reason");

            const previousBlock = await Blocks.findAll({
              where: {
                userId: encrypt(interaction.user.id),
                guildId: interaction.guildId,
              },
            });

            if (previousBlock.length < 1) {
              const newBlock = await Blocks.create({
                userId: encrypt(storedConfession.userId),
                guildId: interaction.guildId,
                modId: interaction.user.id,
                type: "block",
                reason,
                count: 1,
              });
            } else {
              return;
            }
          }
        }
      }
    } else {
      return interaction.editReply({
        content: `This context menu can only be used with confessions made by the bot.`,
      });
    }
  };
  onBefore?: ContextMenu["onBefore"] = async (interaction) => {
    const staffRoleId = (await Configs.findByPk(interaction.guildId))
      ?.staffRoleId;
    const fulfill = Boolean(
      staffRoleId && interaction.member.roles.cache.has(staffRoleId)
    );
    return {
      processedInteraction: interaction,
      code: fulfill
        ? CommandCancelCodes.Success
        : staffRoleId
        ? CommandCancelCodes.MissingPermissions
        : CommandCancelCodes.ImproperConfiguration,
    };
  };
  onCancel?: ContextMenu["onCancel"] = async (interaction, code) => {
    if (code === CommandCancelCodes.MissingPermissions) {
      return await interaction.editReply({
        content: `No staff role has been setup to use this command yet. Please /config to set one up.`,
      });
    } else if (code === CommandCancelCodes.ImproperConfiguration) {
      return await interaction.editReply({
        content: `Only staff members of this server can use this command.`,
      });
    }
  };
  constructor() {
    super();
    this.setName("ConfessionBlock");
    this.setType(ApplicationCommandType.Message);
    this.setDMPermission(false);
    this.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);
  }
}
