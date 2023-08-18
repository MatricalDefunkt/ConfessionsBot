/** @format */

import { SlashCommandSubcommandBuilder } from "discord.js";
import {
  ActionTypes,
  ConfigRoleTypes,
  SubCommand,
} from "../../types/interfaces";

export default class ConfigRole
  extends SlashCommandSubcommandBuilder
  implements SubCommand<"cached">
{
  name = "role";
  description = "Modify the staff role and the role allowed to confess.";

  isAutocompleteSubCommand = () => false;

  execute: SubCommand<"cached">["execute"] = async (interaction) => {
    const action = interaction.options.getNumber("action", true) as ActionTypes;
    const roleType = interaction.options.getString(
      "role-type",
      true
    ) as ConfigRoleTypes;
    const role = interaction.options.getRole("role", true);
    const serverConfig = await getServerConfig(interaction.guildId);

    if (action === ActionTypes.GET) {
      const role = serverConfig[roleType];

      return await interaction.editReply({
        content: `The ${roleType} role is ${role ? `<@&${role}>` : "not set"}`,
      });
    } else if (action === ActionTypes.SET) {
      serverConfig[roleType] = role.id;
      await serverConfig.save();
      return await interaction.editReply({
        content: `The ${Object.entries(ConfigRoleTypes)
          .find((type) => type[1] === roleType)![0]
          .toLowerCase()} role has been set to <@&${role.id}>`,
      });
    } else if (action === ActionTypes.DELETE) {
      serverConfig[roleType] = undefined;
      await serverConfig.save();
      return await interaction.editReply({
        content: `The ${Object.entries(roleType)
          .find((type) => type[1] === roleType)![0]
          .toLowerCase()} role has been deleted.`,
      });
    }
  };
  constructor() {
    super();
    this.setName(this.name);
    this.setDescription(this.description);
    this.addNumberOption((o) =>
      o
        .setName("action")
        .setDescription("The action to perform.")
        .addChoices(
          { name: "Get", value: ActionTypes.GET },
          { name: "Set", value: ActionTypes.SET },
          { name: "Delete", value: ActionTypes.DELETE }
        )
        .setRequired(true)
    );
    this.addStringOption((o) =>
      o
        .setName("role-type")
        .setDescription("The role to modify.")
        .addChoices(
          { name: "Staff", value: ConfigRoleTypes.STAFF },
          { name: "Confession", value: ConfigRoleTypes.CONFESSION }
        )
        .setRequired(true)
    );
    this.addRoleOption((o) =>
      o.setName("role").setDescription("The role to set.").setRequired(true)
    );
  }
}
