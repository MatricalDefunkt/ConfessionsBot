/** @format */

import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import {
  ActionTypes,
  ConfigChannelTypes,
  SubCommand,
} from "../../types/interfaces";

export default class ConfigChannel
  extends SlashCommandSubcommandBuilder
  implements SubCommand<"cached">
{
  name = "channel";
  description = "Modify the channel for confessions or logging.";

  execute: SubCommand<"cached">["execute"] = async (interaction) => {
    const action = interaction.options.getNumber("action", true) as ActionTypes;
    const channelType = interaction.options.getString(
      "channel-type",
      true
    ) as ConfigChannelTypes;
    const channel = interaction.options.getChannel("channel");
    const serverConfig = await getServerConfig(interaction.guildId);

    if (action === ActionTypes.GET) {
      const storedChannelId = serverConfig[channelType];
      interaction.editReply({
        content: `The confessions channel is ${
          storedChannelId ? `<#${storedChannelId}>` : "not set."
        }`,
      });
    } else if (action === ActionTypes.SET) {
      if (!channel)
        return await interaction.editReply({
          content: `Please provide a new channel using the "channel" option.`,
        });
      if (channel.type !== ChannelType.GuildText) {
        return interaction.editReply({
          content: `Please choose a text channel.`,
        });
      }
      if (
        !channel
          .permissionsFor(interaction.guild.members.me!)
          .has(PermissionFlagsBits.SendMessages)
      ) {
        return await interaction.editReply({
          content: `Cannot set this channel as the ${Object.entries(
            ConfigChannelTypes
          )
            .find((type) => type[1] === channelType)![0]
            .toLowerCase()} channel as I do not have the permission to send messages in that channel.`,
        });
      } else {
        serverConfig[channelType] = channel.id;
        await serverConfig.save();
        ServerConfigs.set(interaction.guildId, serverConfig);
        await interaction.editReply({
          content: `The ${Object.entries(ConfigChannelTypes)
            .find((type) => type[1] === channelType)![0]
            .toLowerCase()} channel has been set to <#${channel.id}>.`,
        });
      }
    } else if (action === ActionTypes.DELETE) {
      const serverConfig = await getServerConfig(interaction.guildId);
      serverConfig[channelType] = undefined;
      await serverConfig.save();
      ServerConfigs.set(interaction.guildId, serverConfig);
      return interaction.editReply({
        content: `The ${Object.entries(ConfigChannelTypes)
          .find((type) => type[1] === channelType)![0]
          .toLowerCase()} channel has been deleted from the database.`,
      });
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
        .setDescription(
          "Whether you want to set, get or delete this configuration."
        )
        .addChoices(
          { name: "Get", value: ActionTypes.GET },
          { name: "Set", value: ActionTypes.SET },
          { name: "Delete", value: ActionTypes.DELETE }
        )
        .setRequired(true)
    );
    this.addStringOption((o) =>
      o
        .setName("channel-type")
        .setDescription("The type of channel you want to configure.")
        .addChoices(
          { name: "Confessions", value: ConfigChannelTypes.CONFESSION },
          { name: "Logging", value: ConfigChannelTypes.LOGGING }
        )
        .setRequired(true)
    );
    this.addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription(
          "The channel to set as the new confessions / logging channel."
        )
        .addChannelTypes(ChannelType.GuildText)
    );
  }
}
