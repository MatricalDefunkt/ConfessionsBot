/** @format */

import { InteractionType } from "discord.js";
import contextMenus from "../contextmenus/exports";
import commands from "../commands/exports";
import { CommandCancelCodes, Event } from "../types/interfaces";

export class InteractionCreate implements Event {
  name = "interactionCreate";
  handler: Event["handler"] = (client) => {
    client.on("interactionCreate", async (interaction) => {
      if (interaction.type === InteractionType.ApplicationCommand) {
        if (interaction.isContextMenuCommand()) {
          const contextMenu = contextMenus.find(
            (contextMenu) => contextMenu.name === interaction.commandName
          );
          if (!contextMenu)
            return await interaction.reply({
              content: `There was an error. The command has been incorrectly registered. Contact Matrical ASAP.`,
              ephemeral: true,
            });
          if (interaction.inCachedGuild()) {
            if (contextMenu.onBefore && contextMenu.onCancel) {
              await interaction.deferReply({ ephemeral: true });
              const { processedInteraction, code } = await contextMenu.onBefore(
                interaction
              );
              if (code !== CommandCancelCodes.Success)
                return await contextMenu.onCancel(processedInteraction, code);
              else return await contextMenu.execute(processedInteraction);
            }
          }
        } else if (interaction.isChatInputCommand()) {
          const command = commands.find(
            (command) => command.name === interaction.commandName
          );
          if (interaction.inRawGuild() && !command?.isDMCommand()) {
            interaction.client.guilds.fetch({
              cache: true,
              force: true,
              guild: interaction.guildId,
            });
            return;
          }
          if (!command)
            return interaction.reply({
              content: `There was an error. The command has been incorrectly registered. Contact Matrical ASAP.`,
              ephemeral: true,
            });

          const { canBeDeferred } = command;

          if (interaction.inCachedGuild() && command.isGuildCommand()) {
            if (command.onBefore && command.onCancel) {
              const { processedInteraction, code } = await command.onBefore(
                interaction
              );
              if (code === CommandCancelCodes.Success) {
                if (
                  !processedInteraction.replied ||
                  !processedInteraction.deferred
                )
                  if (
                    (canBeDeferred === true ||
                      typeof canBeDeferred === "undefined") &&
                    !command.isSubCommandParent()
                  )
                    await processedInteraction.deferReply({ ephemeral: true });
                return await command.execute(processedInteraction);
              } else {
                if (
                  (canBeDeferred === true ||
                    typeof canBeDeferred === "undefined") &&
                  !command.isSubCommandParent()
                )
                  await processedInteraction.deferReply({ ephemeral: true });
                return await command.onCancel(processedInteraction, code);
              }
            } else {
              if (
                (canBeDeferred === true ||
                  typeof canBeDeferred === "undefined") &&
                !command.isSubCommandParent()
              )
                await interaction.deferReply({ ephemeral: true });
              return await command.execute(interaction);
            }
          } else if (command.isDMCommand()) {
            if (command.onBefore && command.onCancel) {
              const { processedInteraction, code } = await command.onBefore(
                interaction
              );
              if (code === CommandCancelCodes.Success) {
                if (
                  !processedInteraction.replied ||
                  !processedInteraction.deferred
                )
                  if (
                    (canBeDeferred === true ||
                      typeof canBeDeferred === "undefined") &&
                    !command.isSubCommandParent()
                  )
                    await processedInteraction.deferReply({ ephemeral: true });
                return await command.execute(processedInteraction);
              } else {
                if (
                  (canBeDeferred === true ||
                    typeof canBeDeferred === "undefined") &&
                  !command.isSubCommandParent()
                )
                  await processedInteraction.deferReply({ ephemeral: true });
                return await command.onCancel(processedInteraction, code);
              }
            } else {
              if (
                (canBeDeferred === true ||
                  typeof canBeDeferred === "undefined") &&
                !command.isSubCommandParent()
              )
                await interaction.deferReply({ ephemeral: true });
              return await command.execute(interaction);
            }
          }
        }
      }
    });
  };
}
