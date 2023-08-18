/** @format */

import { Client, Collection, If } from "discord.js";
import * as globals from "global";
import { Configs, BotCommands } from "../database/database";

declare global {
  /**
   * To be used only inside scripts running after clientstart.ts runs.
   */
  var BotClient: Client<true>;
  /**
   * All server configurations for easy access.
   */
  var ServerConfigs: Collection<string, Configs>;
  /**
   * Global method to get the server configuration (or create if one doesn't exist) for a server.
   * @param {string} guildId The id of the server.
   * @returns {Promise<Configs>} The server configuration.
   */
  function getServerConfig(
    guildId: string,
    defaults?: Partial<Configs>
  ): Promise<Configs>;
  /**
   * Global method to get a command and its ID
   * @param {string} commandName The name of the command.
   * @returns {Promise<BotCommands | null>} The command.
   */
  function getCommand(commandName: string): Promise<BotCommands | null>;
}
