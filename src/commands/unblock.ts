/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommand, CommandCancelCodes } from "../types/interfaces";
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  ComponentType,
  PermissionFlagsBits,
  TextInputStyle,
} from "discord.js";
import { Blocks, Configs } from "../database/database";
import {
  createConfirmationButtons,
  disableButtons,
} from "../utils/buttonCreators";
import { createUnblockRequestEmbed } from "../utils/embedCreators";

const reasonModal = new ModalBuilder()
  .setCustomId("reasonModal")
  .setTitle("Unblock Reason:");
const reasonInputComponent = new TextInputBuilder()
  .setStyle(TextInputStyle.Paragraph)
  .setCustomId("reason")
  .setLabel("Reason for ublocking. Will be logged.")
  .setPlaceholder("Under 512 characters...")
  .setMaxLength(512)
  .setRequired(true);
const reasonInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
  reasonInputComponent
);
reasonModal.addComponents(reasonInputRow);

export default class Unblock
  extends SlashCommandBuilder
  implements ChatInputCommand<"cached">
{
  execute: ChatInputCommand<"cached">["execute"] = async (interaction) => {
    const user = interaction.options.getUser("user", true);
    const block = await Blocks.findOne({
      where: {
        userId: user.id,
        guildId: interaction.guildId,
      },
    });

    if (!block)
      return await interaction.reply({
        content: `This user is not blocked.`,
        ephemeral: true,
      });

    await interaction.showModal(reasonModal);
    const reason = await interaction
      .awaitModalSubmit({
        time: 300_000,
      })
      .catch(async (e) => {
        if (e.code === "INTERACTION_COLLECTOR_ERROR") {
          await interaction.editReply({
            content: `You did not submit modal in time. The action has been cancelled.`,
          });
          return;
        } else console.error(e);
      });
    if (reason) {
      const confirmButtons = createConfirmationButtons("unblock", "cancel");
      const reply = await reason.reply({
        embeds: [createUnblockRequestEmbed(interaction)],
        components: confirmButtons,
        ephemeral: true,
      });

      const button = await reply
        .awaitMessageComponent({
          time: 300_000,
          componentType: ComponentType.Button,
        })
        .catch(async (e) => {
          if (e.code === "INTERACTION_COLLECTOR_ERROR")
            await interaction.editReply({
              content: `Did not click buttons in time.`,
              components: disableButtons(confirmButtons),
            });
          else console.error(e);
          return;
        });
      console.log(button);
      if (button) {
        await button.update({
          content: `Processing...`,
          components: disableButtons(confirmButtons),
        });
        block.setAttributes({
          count: block.count + 1,
          type: "unblock",
          reason: reason?.fields.getTextInputValue("reason")!,
          modId: interaction.user.id,
          guildId: interaction.guildId!,
          userId: user.id,
        });
        await block.save();
        await button.editReply({
          content: `Unblocked ${user.tag} successfully.`,
        });
      }
    }
  };
  onBefore?: ChatInputCommand<"cached">["onBefore"] = async (interaction) => {
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
  onCancel?: ChatInputCommand<"cached">["onCancel"] = async (
    interaction,
    code
  ) => {
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

  isGuildCommand = () => true;
  isDMCommand = () => false;
  isSubCommandParent = () => false;
  isAutocompleteCommand = () => false;

  canBeDeferred = false;

  constructor() {
    super();
    this.setName("unblock");
    this.setDescription("Unblocks a user from making confessions.");
    this.addUserOption((o) =>
      o.setName("user").setDescription("The user to unblock.").setRequired(true)
    );
    this.setDMPermission(false);
    this.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);
  }
}
