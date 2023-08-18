/** @format */

import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { SubCommand } from "../../types/interfaces";

export default class ConfigGet
  extends SlashCommandSubcommandBuilder
  implements SubCommand<"cached">
{
  name = "get";
  description = "Gets the server's combined configurations.";

  execute: SubCommand<"cached">["execute"] = async (interaction) => {
    const embed = new EmbedBuilder();
    const serverConfig = await getServerConfig(interaction.guildId);
    await interaction.editReply({
      embeds: [embed],
    });
  };

  isAutocompleteSubCommand: SubCommand<"cached">["isAutocompleteSubCommand"] =
    () => false;

  constructor() {
    super();
    this.setName(this.name);
    this.setDescription(this.description);
  }
}
