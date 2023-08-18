/** @format */

import { ApplicationCommandType } from "discord.js";
import { Sequelize, DataTypes, Model } from "sequelize";
import { config } from "dotenv";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

config({ path: path.join(__dirname, "../../.env") });

interface Argv {
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

if (
  !process.env.DB_NAME ||
  !process.env.DB_UID ||
  !process.env.DB_PASS ||
  !process.env.DB_NAME_BETA
) {
  throw new Error("Missing database credentials.");
}

const sequelize = new Sequelize(
  argv["beta"] ? process.env.DB_NAME_BETA : process.env.DB_NAME,
  process.env.DB_UID,
  process.env.DB_PASS,
  {
    host: "localhost",
    port: 8080,
    dialect: "mysql",
    typeValidation: true,
    logging: false,
  }
);

type BlockTypes = "block" | "unblock";

export class Confessions extends Model<{
  messageId: string;
  guildId: string;
  userId: string;
  channelId: string;
}> {
  public get messageId() {
    return this.getDataValue("messageId");
  }
  public get guildId() {
    return this.getDataValue("guildId");
  }
  public get userId() {
    return this.getDataValue("userId");
  }
  public get channelId() {
    return this.getDataValue("channelId");
  }
}

Confessions.init(
  {
    messageId: { type: DataTypes.STRING(256), primaryKey: true },
    guildId: DataTypes.STRING(20),
    userId: DataTypes.STRING(20),
    channelId: DataTypes.STRING(20),
  },
  { sequelize, tableName: "confessions" }
);

export class Blocks extends Model<{
  userId: string;
  guildId: string;
  modId: string;
  reason: string;
  type: string;
  count: number;
}> {
  public get userId() {
    return this.getDataValue("userId") as string;
  }
  public get guildId() {
    return this.getDataValue("guildId") as string;
  }
  public get modId() {
    return this.getDataValue("modId") as string;
  }
  public set modId(newModId: string) {
    this.setDataValue("modId", newModId);
  }
  public get reason() {
    return this.getDataValue("reason") as string;
  }
  public set reason(newReason: string) {
    this.setDataValue("reason", newReason);
  }
  public get type() {
    return this.getDataValue("type") as BlockTypes;
  }
  public set type(newType: BlockTypes) {
    this.setDataValue("type", newType);
  }
  public get count() {
    return this.getDataValue("count") as number;
  }
  public set count(newCount: number) {
    this.setDataValue("count", newCount);
  }
}

Blocks.init(
  {
    userId: { type: DataTypes.STRING(20), primaryKey: true },
    guildId: { type: DataTypes.STRING(20), primaryKey: true },
    modId: DataTypes.STRING(20),
    type: { type: DataTypes.ENUM(), values: ["block", "unblock"] },
    reason: DataTypes.STRING(512),
    count: DataTypes.INTEGER(),
  },
  { sequelize, tableName: "blocks" }
);

export class Configs extends Model<{
  guildId: string;
  confessChannelId?: string;
  loggingChannelId?: string;
  helpChannelId?: string;
  staffRoleId?: string;
  confessRoleId?: string;
  requireConfessRole?: boolean;
}> {
  public get guildId() {
    return this.getDataValue("guildId");
  }
  public set guildId(newId) {
    this.setDataValue("guildId", newId);
    this._onUpdate();
  }
  public get confessChannelId() {
    return this.getDataValue("confessChannelId");
  }
  public set confessChannelId(newId) {
    this.setDataValue("confessChannelId", newId);
    this._onUpdate();
  }
  public get loggingChannelId() {
    return this.getDataValue("loggingChannelId");
  }
  public set loggingChannelId(newId) {
    this.setDataValue("loggingChannelId", newId);
    this._onUpdate();
  }
  public get helpChannelId() {
    return this.getDataValue("helpChannelId");
  }
  public set helpChannelId(newId) {
    this.setDataValue("helpChannelId", newId);
    this._onUpdate();
  }
  public get staffRoleId() {
    return this.getDataValue("staffRoleId");
  }
  public set staffRoleId(newId) {
    this.setDataValue("staffRoleId", newId);
    this._onUpdate();
  }
  public get confessRoleId() {
    return this.getDataValue("confessRoleId");
  }
  public set confessRoleId(newId) {
    this.setDataValue("confessRoleId", newId);
    this._onUpdate();
  }
  public get requireConfessRole() {
    return this.getDataValue("requireConfessRole");
  }
  public set requireConfessRole(newBool) {
    this.setDataValue("requireConfessRole", newBool);
    this._onUpdate();
  }
  private async _onUpdate() {
    ServerConfigs.set(this.guildId, this);
    await this.save();
  }
}

Configs.init(
  {
    guildId: { type: DataTypes.STRING(20), primaryKey: true },
    confessChannelId: DataTypes.STRING(20),
    loggingChannelId: DataTypes.STRING(20),
    helpChannelId: DataTypes.STRING(20),
    staffRoleId: DataTypes.STRING(20),
    confessRoleId: DataTypes.STRING(20),
    requireConfessRole: DataTypes.BOOLEAN(),
  },
  { sequelize, tableName: "configs" }
);

export class BotCommands extends Model<{
  commandName: string;
  commandId: string;
  type: ApplicationCommandType;
}> {
  public get commandName() {
    return this.getDataValue("commandName");
  }
  public set commandName(newName) {
    this.setDataValue("commandName", newName);
  }
  public get commandId() {
    return this.getDataValue("commandId");
  }
  public set commandId(newId) {
    this.setDataValue("commandId", newId);
  }
  public get type() {
    return this.getDataValue("type");
  }
  public set type(newType) {
    this.setDataValue("type", newType);
  }
  public toString() {
    return `/:${this.commandName}:${this.commandId}`;
  }
}

BotCommands.init(
  {
    commandName: { type: DataTypes.STRING(20), primaryKey: true },
    commandId: DataTypes.STRING(20),
    type: DataTypes.TINYINT(),
  },
  { sequelize, tableName: "botcommands" }
);

(async () => {
  await Confessions.sync({ alter: true });
  await Blocks.sync({ alter: true });
  await Configs.sync({ alter: true });
  await BotCommands.sync({ alter: true });
})();
