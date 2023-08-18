/** @format */

import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { ChannelType, Client, Collection, IntentsBitField } from "discord.js";
import { ChatInputCommand, ContextMenu } from "./types/interfaces";
import { registerCommands } from "./utils/registerCommands";
import commands from "./commands/exports";
import contextMenus from "./contextmenus/exports";
import events from "./events/exports";
import { BotCommands, Configs } from "./database/database";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Logger } from "./utils/botlog";
import { inspect } from "node:util";

export interface Argv {
  registerCommands: boolean;
  "register-commands": boolean;
  beta: boolean;
  _: string[];
}

const argv = yargs(hideBin(process.argv))
  .option("register-commands", {
    alias: "r",
    type: "boolean",
    description: "Register commands with Discord API.",
  })
  .option("beta", {
    alias: "b",
    type: "boolean",
    description: "Run in beta mode.",
  }).argv as Argv;

export class CommandClient<Ready extends boolean> extends Client<Ready> {
  declare commands: Collection<string, ChatInputCommand>;
  declare contextMenus: Collection<string, ContextMenu>;
}

const token = argv.beta ? process.env.BETA_TOKEN : process.env.TOKEN;
if (!token) throw new Error("No token was provided.");

const testChannelId = process.env.TESTCHANNELID;
if (!testChannelId) throw new Error("No test channel id was provided.");

const client = new CommandClient({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.GuildMessages,
  ],
  shards: "auto",
});

client.commands = new Collection();
for (const command of commands) {
  client.commands.set(command.name, command);
}

client.contextMenus = new Collection();
for (const contextMenu of contextMenus) {
  client.contextMenus.set(contextMenu.name, contextMenu);
}

globalThis.getServerConfig = async function (guildId) {
  const config = ServerConfigs.get(guildId);
  if (config) return config;
  const newConfig = new Configs();
  newConfig.guildId = guildId;
  await newConfig.save();
  ServerConfigs.set(guildId, newConfig);
  return newConfig;
};

globalThis.getCommand = async function (
  commandName
): Promise<BotCommands | null> {
  const command = await BotCommands.findByPk(commandName);
  if (command) return command;
  else
    console.warn(
      `Command ${commandName} not found in database, re-registering commands.`
    );
  await registerCommands(
    client.application!.id,
    client.commands,
    client.contextMenus,
    argv
  );
  return await BotCommands.findByPk(commandName);
};

client.on("ready", async (loggedInClient) => {
  await loggedInClient.application.fetch();
  loggedInClient.user.setPresence({ status: "invisible" });
  globalThis.BotClient = loggedInClient;

  globalThis.ServerConfigs = new Collection<string, Configs>();
  const serverConfigs = await Configs.findAll();
  for (const serverConfig of serverConfigs) {
    ServerConfigs.set(serverConfig.guildId, serverConfig);
  }
  const registerCommandsBool = argv["register-commands"];
  if (registerCommandsBool) {
    registerCommands(
      loggedInClient.application.id,
      client.commands,
      client.contextMenus,
      argv
    );
  }
  console.log(`${loggedInClient.user.tag} has logged in.`);
  const testChannel = await client.channels.fetch(testChannelId, {
    force: false,
    cache: true,
  });
  if (testChannel?.type !== ChannelType.GuildText)
    throw new TypeError(
      `Invalid channel type. Expected "ChannelType.GuildText", got ${testChannel?.type}`
    );
  testChannel.send({
    content: `${loggedInClient.user.tag} has logged in with ${
      loggedInClient.guilds.cache.size
    } servers in cache, and ${
      loggedInClient.users.cache.size
    } members in cache, on <t:${Math.trunc(
      loggedInClient.readyTimestamp / 1000
    )}:F>`,
  });

  for (const event of events) {
    await event.handler(client);
  }
});

client.login(token);

process.on("warning", Logger.error);
process.on("unhandledRejection", Logger.error);
process.on("uncaughtException", Logger.error);
client.on("debug", Logger.debug);
client.on("error", console.log);
client.rest.on("rateLimited", (data) => Logger.error(inspect(data)));
