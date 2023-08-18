/** @format */

import {
  CommandInteraction,
  MessageContextMenuCommandInteraction,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Configs } from "src/database/database";

export const createConfessionEmbed = ({
  interaction,
  type,
  confession,
  anonymous,
}: {
  interaction: CommandInteraction<"cached">;
  type: "Confession" | "Reply";
  confession: string;
  anonymous: "anonymous" | "signed";
}): EmbedBuilder => {
  const confessionEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${anonymous === "anonymous" ? `Anon#0000` : interaction.user.tag}`,
      iconURL: `${
        anonymous === "anonymous"
          ? interaction.client.user!.displayAvatarURL()
          : interaction.user.displayAvatarURL()
      }`,
    })
    .setDescription(confession)
    .setColor("Random")
    .setTitle(type);
  return confessionEmbed;
};

export const createBlockRequestEmbed = ({
  interaction,
  messageURL,
}: {
  messageURL: string;
  interaction: MessageContextMenuCommandInteraction<"cached">;
}): EmbedBuilder => {
  const requestEmbed = new EmbedBuilder()
    .setAuthor({
      name: interaction.user.tag,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setDescription(
      `You are about to block the creator of (this)[${messageURL}] confession. Proceed? You have five minutes to decide.`
    )
    .setColor("Red")
    .setTitle("Block Request:")
    .setURL(messageURL);
  return requestEmbed;
};

export function createConfigsEmbed(
  config: Configs,
  interaction: ChatInputCommandInteraction<"cached">
) {
  const embed = new EmbedBuilder();
  embed.setTitle("Configuration:" + interaction.guildId).addFields(
    {
      name: `Confessions Channel`,
      value: config.confessChannelId ?? `Not Setup`,
    },
    {
      name: `Staff Role`,
      value: config.staffRoleId ? `<@${config.staffRoleId}>` : `Not Setup`,
    }
  );
}
