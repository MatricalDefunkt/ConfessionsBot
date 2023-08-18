/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import { Configs } from "../database/database";
import { SubCommandParent, CommandCancelCodes } from "../types/interfaces";
import subCommands from "./config/exports";

export default class Count
  extends SlashCommandBuilder
  implements SubCommandParent<"cached">
{
  name = "config";
  description = "Configure this bot for this server.";
  children: SubCommandParent<"cached">["children"] = subCommands;

  execute: SubCommandParent<"cached">["execute"] = async (interaction) => {
    const subCommand = this.children.find(
      (subCommand) =>
        subCommand.name === interaction.options.getSubcommand(true)
    );
    if (!subCommand)
      return await interaction.editReply({
        content: `This command has not been implemented yet. Please try again later!`,
      });
    if (
      subCommand.canBeDeferred === true ||
      typeof subCommand.canBeDeferred === "undefined"
    )
      await interaction.deferReply({ ephemeral: true });
    await subCommand.execute(interaction);
    return;
  };

  onBefore: SubCommandParent<"cached">["onBefore"] = async (interaction) => {
    const serverConfig =
      ServerConfigs.get(interaction.guildId) ??
      (await getServerConfig(interaction.guildId));
    if (!serverConfig) {
      ServerConfigs.set(interaction.guildId, serverConfig);
      return {
        processedInteraction: interaction,
        code: CommandCancelCodes.ImproperConfiguration,
      };
    } else {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return {
          processedInteraction: interaction,
          code: CommandCancelCodes.MissingPermissions,
        };
      else
        return {
          processedInteraction: interaction,
          code: CommandCancelCodes.Success,
        };
    }
  };

  onCancel: SubCommandParent<"cached">["onCancel"] = async (
    interaction,
    code
  ) => {
    switch (code) {
      case CommandCancelCodes.ImproperConfiguration:
        await interaction.reply({
          content: `There was a problem finding the previous configuration. A new one has been created, please try again.`,
          ephemeral: true,
        });
        break;
      case CommandCancelCodes.MissingPermissions:
        await interaction.reply({
          content: `You do not have the permission to use this command!`,
          ephemeral: true,
        });
        break;
    }
  };

  isGuildCommand: SubCommandParent<"cached">["isGuildCommand"] = () => {
    return !this.dm_permission;
  };

  isDMCommand: SubCommandParent<"cached">["isDMCommand"] = () => {
    return this.dm_permission;
  };

  isSubCommandParent: SubCommandParent<"cached">["isSubCommandParent"] = () => {
    return true;
  };

  isAutocompleteCommand: SubCommandParent<"cached">["isAutocompleteCommand"] =
    () => {
      return false;
    };

  isAutocompleteParent: SubCommandParent<"cached">["isAutocompleteParent"] =
    () => {
      return false;
    };

  constructor() {
    super();
    this.setName(this.name);
    this.setDescription(this.description);
    this.setDMPermission(false);
    this.children.forEach((child) => this.addSubcommand(child));
    this.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);
  }
}
