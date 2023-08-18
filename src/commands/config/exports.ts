/** @format */

import { SubCommand } from "src/types/interfaces";
import ConfigChannel from "./channel";
import ConfigRole from "./role";

const subCommands: SubCommand<"cached">[] = [
  new ConfigChannel(),
  new ConfigRole(),
];
export default subCommands;
