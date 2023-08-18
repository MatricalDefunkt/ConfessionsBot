/** @format */

import { Configs } from "../database/database";
import { Event } from "../types/interfaces";
import { CommandClient } from "src";

export class GuildDelete implements Event {
  name = "guildDelete";
  handler: Event["handler"] = async (client: CommandClient<true>) => {
    client.on("guildDelete", async (guild) => {
      Configs.destroy({ where: { guildId: guild.id } });
      ServerConfigs.delete(guild.id);
    });
  };
}
