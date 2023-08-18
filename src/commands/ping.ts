/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommand } from "../types/interfaces";

export default class Ping
  extends SlashCommandBuilder
  implements ChatInputCommand
{
  name = "ping";
  description = "Checks the ping of the bot";
  execute: ChatInputCommand["execute"] = async (interaction) => {
    const reply = await interaction.editReply({
      content: "Running...",
    });
    const difference = reply.createdTimestamp - interaction.createdTimestamp;
    return interaction.editReply({
      content: `Pong!!\nRoundtrip latency is \`${difference}\`ms\nWS heartbeat is \`${BotClient.ws.ping}\``,
    });
  };

  isGuildCommand: ChatInputCommand["isGuildCommand"] = () => {
    return !this.dm_permission;
  };

  isDMCommand: ChatInputCommand["isDMCommand"] = () => {
    return this.dm_permission;
  };

  isSubCommandParent: ChatInputCommand["isSubCommandParent"] = () => {
    return false;
  };

  isAutocompleteCommand: ChatInputCommand["isAutocompleteCommand"] = () => {
    return false;
  };

  constructor() {
    super();
    this.setName(this.name);
    this.setDescription(this.description);
    this.setDMPermission(true);
  }
}
