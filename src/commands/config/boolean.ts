/** @format */

import { ComponentType, SlashCommandSubcommandBuilder } from "discord.js";
import { getKeyFromValue } from "../../utils/getKeyFromValue";
import {
  ActionTypes,
  ConfigBoolTypes,
  SubCommand,
} from "../../types/interfaces";
import {
  createConfirmationButtons,
  disableButtons,
} from "../../utils/buttonCreators";

export default class ConfigBoolean
  extends SlashCommandSubcommandBuilder
  implements SubCommand<"cached">
{
  name = "true-false";
  description = "Modify some true/false settings of the bot.";

  execute: SubCommand<"cached">["execute"] = async (interaction) => {
    const action = interaction.options.getNumber("action", true) as ActionTypes;
    const optionType = interaction.options.getString(
      "option-type",
      true
    ) as ConfigBoolTypes;
    const serverConfig = await getServerConfig(interaction.guildId);
    const newValue = interaction.options.getBoolean("true-false");

    if (action === ActionTypes.GET) {
      return await interaction.editReply({
        content: `The \`${getKeyFromValue(
          ConfigBoolTypes,
          optionType
        ).toLowerCase()}\` option is ${
          serverConfig[optionType] ? "enabled" : "disabled"
        }`,
      });
    } else if (action === ActionTypes.SET) {
      if (newValue === null) {
        return await interaction.editReply({
          content: "You must provide a new value to set.",
        });
      }
      serverConfig[optionType] = newValue;
      return await interaction.editReply({
        content: `The \`${getKeyFromValue(
          ConfigBoolTypes,
          optionType
        ).toLowerCase()}\` option has been ${
          newValue ? "enabled" : "disabled"
        }`,
      });
    } else if (action === ActionTypes.DELETE) {
      const buttons = createConfirmationButtons("yes", "no");
      const reply = await interaction.editReply({
        content: `Are you sure you want to delete the \`${getKeyFromValue(
          ConfigBoolTypes,
          optionType
        ).toLowerCase()}\` option?`,
        components: buttons,
      });
      const response = await reply
        .awaitMessageComponent({
          componentType: ComponentType.Button,
          time: 10000,
        })
        .catch((error) => {
          if (error.code === 50001) {
            interaction.editReply({
              content: "You took too long to respond.",
              components: disableButtons(buttons),
            });
          }
        });
      if (response) {
        if (response.customId === "yes") {
          serverConfig[optionType] = undefined;
          await serverConfig.save();
          return await response.editReply({
            content: `The \`${getKeyFromValue(
              ConfigBoolTypes,
              optionType
            ).toLowerCase()}\` option has been deleted.`,
            components: disableButtons(buttons),
          });
        } else if (response.customId === "no") {
          return await response.editReply({
            content: "The action has been cancelled.",
            components: disableButtons(buttons),
          });
        }
      }
    }
  };

  isAutocompleteSubCommand = () => false;

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
        .setName("option-type")
        .setDescription("The true/false value to modify.")
        .addChoices({
          name: "Require confession role to use /confess",
          value: ConfigBoolTypes["REQUIRE CONFESSION ROLE"],
        })
        .setRequired(true)
    );
    this.addBooleanOption((o) =>
      o.setName("true-false").setDescription("The new boolean to set.")
    );
  }
}
