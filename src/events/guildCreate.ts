/** @format */

import { ChannelType, Collection, TextChannel } from "discord.js";
import { Configs } from "../database/database";
import { Event } from "../types/interfaces";
import { CommandClient } from "src";

export class GuildCreate implements Event {
  name = "guildCreate";
  handler: Event["handler"] = async (client: CommandClient<true>) => {
    client.on("guildCreate", async (guild) => {
      const config = await Configs.create({ guildId: guild.id }).catch((e) => {
        if (e.name === "SequelizeUniqueConstraintError") return;
        else return console.error(e);
      });
      if (config) ServerConfigs.set(guild.id, config);

      //TODO: Remove this when the bot is ready for public use.
      if (guild.ownerId !== BotClient.application.owner!.id) {
        await guild.leave();
        return;
      }

      const owner = await guild.fetchOwner({ force: false, cache: true });
      await owner
        .createDM()
        .then(async (dmChannel) => {
          await dmChannel.send({
            content: `Thank you for inviting ConfessionsBot to your server! To get started, please use the command /config.`,
          });
        })
        .catch((err) => {
          if (err.code === 50007) {
            const textChannels = guild.channels.cache.filter(
              (channel) => channel.type === ChannelType.GuildText
            ) as Collection<string, TextChannel>;
            textChannels
              .first()
              ?.send({
                content: `Thank you for inviting ConfessionsBot to your server! To get started, please use the command /config.`,
              })
              .catch(console.error);
          }
        });
    });
  };
}
