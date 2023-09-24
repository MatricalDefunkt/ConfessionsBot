/** @format */
import { ChatInputCommand } from "../types/interfaces";
import Confess from "./confess";
import Config from "./config";
import Eval from "./eval";
import Ping from "./ping";
import Unblock from "./unblock";

const commands: ChatInputCommand<any>[] = [
  new Ping(),
  new Confess(),
  new Config(),
  new Eval(),
  new Unblock(),
];
for (const command of commands) {
  let counter = 0;
  if (command.onBefore) counter++;
  if (command.onCancel) counter++;
  if (![0, 2].includes(counter))
    throw new Error(
      "Command does not have any one of an onBefore or an onCancel"
    );
}

export default commands;
