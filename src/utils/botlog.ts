/** @format */

import { appendFileSync } from "fs";
import { ConnectionRefusedError } from "sequelize";

type LogTypes = "primary" | "error" | "debug";

export class Logger {
  /**
   * Logs given data in src/logs/primarylog.log
   * @param data The data to log
   */
  public static log(data: string | Buffer) {
    if (data instanceof Buffer) {
      console.log(data.toString().trim());
    } else console.log(data.trim());
    Logger._appendLog(data, "primary");
  }
  /**
   * Logs given data in src/logs/primarylog.log
   * @param data The data to log
   */
  public static debug(data: string | Buffer) {
    if (data instanceof Buffer) {
      console.log(data.toString().trim());
    } else console.log(data.trim());
    Logger._appendLog(data, "debug");
  }
  /**
   * Logs given errors in src/logs/errorlog.log
   * @param error The error to log
   */
  public static error(error: string | Buffer | Error) {
    if (error instanceof Buffer) {
      console.error(error.toString().trim());
    } else if (error instanceof Error) {
      console.error(error.stack);
    } else console.trace(error.trim());
    Logger._appendLog(error, "error");
  }
  private static _appendLog(data: string | Buffer | Error, type: LogTypes) {
    appendFileSync(
      `${process.cwd()}/src/logs/${type}log.log`,
      `${new Date()} ||> ${data}`,
      {
        encoding: "utf8",
      }
    );
  }
}
