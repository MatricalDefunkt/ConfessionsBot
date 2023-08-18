/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ActionRowBuilder,
  ModalBuilder,
  Team,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Logger } from "../utils/botlog";
import { ChatInputCommand, CommandCancelCodes } from "../types/interfaces";

export const trueFalseArrays = {
  trueArray: ["true", "yes", "y", "t"],
  falseArray: ["f", "n", "no", "false"],
};

const evalModal = new ModalBuilder()
  .setCustomId("evalModal")
  .setTitle("Block Reason:");
const evalInputBox = new TextInputBuilder()
  .setStyle(TextInputStyle.Paragraph)
  .setCustomId("code")
  .setLabel("Code to evaluate...")
  .setRequired(true);
const ephemeralInputBox = new TextInputBuilder()
  .setStyle(TextInputStyle.Short)
  .setCustomId("ephemeral")
  .setLabel("Do you want ephemeral");
const codeBlockInputBox = new TextInputBuilder()
  .setStyle(TextInputStyle.Short)
  .setCustomId("codeblock")
  .setLabel("Do you want a codeblock");
const evalInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
  evalInputBox
);
const codeBlockInputRow =
  new ActionRowBuilder<TextInputBuilder>().addComponents(ephemeralInputBox);
const ephemeralInputRow =
  new ActionRowBuilder<TextInputBuilder>().addComponents(codeBlockInputBox);

evalModal.addComponents(evalInputRow, codeBlockInputRow, ephemeralInputRow);

export default class Eval
  extends SlashCommandBuilder
  implements ChatInputCommand
{
  name = "eval";
  description = "BOT-OWNER ONLY COMMAND.";
  execute: ChatInputCommand["execute"] = async (interaction) => {
    await interaction.showModal(evalModal);
    const modalSubmitInteraction = await interaction
      .awaitModalSubmit({
        time: 600_000,
      })
      .catch(async (e) => {
        if (e.code === "INTERACTION_COLLECTOR_ERROR")
          await interaction.followUp({
            content: `Did not submit modal in time. Command has been cancelled`,
            ephemeral: true,
          });
        else console.error(e);
      });
    if (modalSubmitInteraction) {
      const ephemeral = trueFalseArrays.trueArray.includes(
        modalSubmitInteraction.fields.getTextInputValue("ephemeral")
      );
      const codeBlock = trueFalseArrays.trueArray.includes(
        modalSubmitInteraction.fields.getTextInputValue("codeblock")
      );
      await modalSubmitInteraction.deferReply({ ephemeral });
      const code = modalSubmitInteraction.fields.getTextInputValue("code");
      try {
        const returnedValue = eval(code);
        if (returnedValue)
          await modalSubmitInteraction.editReply({
            content: `${
              codeBlock
                ? `Successfully executed:\n\`\`\`js\n${returnedValue}\`\`\``
                : returnedValue
            }`,
          });
      } catch (e: any) {
        Logger.error(e);
        await modalSubmitInteraction.editReply({
          content: `*ERROR*:\n\`\`\`js${e}\`\`\``,
        });
      }
    }
  };

  onBefore: ChatInputCommand["onBefore"] = async (interaction) => {
    if (BotClient.application.owner instanceof Team) {
      if (
        !BotClient.application.owner.members.some(
          (member) => member.id === interaction.user.id
        )
      )
        return {
          processedInteraction: interaction,
          code: CommandCancelCodes.MissingPermissions,
        };
      else
        return {
          processedInteraction: interaction,
          code: CommandCancelCodes.Success,
        };
    } else {
      const isOwner = BotClient.application.owner?.id === interaction.user.id;
      return {
        processedInteraction: interaction,
        code: isOwner
          ? CommandCancelCodes.Success
          : CommandCancelCodes.MissingPermissions,
      };
    }
  };

  onCancel: ChatInputCommand["onCancel"] = async (interaction, code) => {
    return await interaction.reply({
      content: `You are not authorized to run this command.`,
      ephemeral: true,
    });
  };

  isGuildCommand: ChatInputCommand["isGuildCommand"] = () => {
    return !Boolean(this.dm_permission);
  };

  isDMCommand: ChatInputCommand["isDMCommand"] = () => {
    return Boolean(this.dm_permission);
  };

  isSubCommandParent: ChatInputCommand["isSubCommandParent"] = () => {
    return false;
  };

  isAutocompleteCommand: ChatInputCommand["isAutocompleteCommand"] = () => {
    return false;
  };

  canBeDeferred = false;

  constructor() {
    super();
    this.setName(this.name);
    this.setDescription(this.description);
    this.setDMPermission(true);
    this.setDefaultMemberPermissions(0n);
  }
}
