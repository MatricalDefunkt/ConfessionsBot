/** @format */

import { Event } from "../types/interfaces";
import { GuildCreate } from "./guildCreate";
import { GuildDelete } from "./guildDelete";
import { InteractionCreate } from "./interactionCreate";
import { MessageCreate } from "./messageCreate";

const events: Event[] = [
  new InteractionCreate(),
  new GuildCreate(),
  new GuildDelete(),
  new MessageCreate(),
];
export default events;
