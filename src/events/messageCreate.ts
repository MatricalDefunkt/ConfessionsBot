/** @format */

import { Event } from "../types/interfaces";
import { CommandClient } from "..";
import { PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { BotCommands } from "../database/database";

export class MessageCreate implements Event {
  name = "messageCreate";
  handler: Event["handler"] = async (client: CommandClient<true>) => {
    client.on("messageCreate", async (message) => {
      if (!(message.content && message.content === `<@${BotClient.user.id}>`))
        return;

      if (message.inGuild()) {
        if (
          message.guild?.members.me?.permissions.has(
            PermissionFlagsBits.SendMessages
          ) &&
          message.channel
            .permissionsFor(message.guild.members.me)
            .has(PermissionFlagsBits.SendMessages)
        ) {
          const configCommand = await getCommand("config");
          await message.reply({
            content: `Hey there! This bot only replies to /commands! ${
              message.member?.permissions.has(
                PermissionFlagsBits.Administrator &&
                  PermissionFlagsBits.ManageGuild
              )
                ? `To set it up, you can use the command ${
                    configCommand
                      ? `</${configCommand.commandName}:${configCommand.commandId}>`
                      : `/config`
                  }!`
                : ``
            }`,
          });
        }
      }
    });
  };
}
