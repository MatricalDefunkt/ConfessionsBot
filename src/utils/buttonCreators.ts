/** @format */

import {
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  Message,
  ComponentType,
  ButtonComponent,
  MessageActionRowComponent,
} from "discord.js";

/**
 * Create an action row with two buttons for confirmation and cancellation of an action.
 * @param {string} confirmCustomId Custom ID for confirmation button
 * @param {string} cancelCustomId Custom ID for cancellation button
 * @returns {ActionRowBuilder<ButtonBuilder>[]}Action row with the buttons
 */
export const createConfirmationButtons = (
  confirmCustomId: string,
  cancelCustomId: string
) => {
  const row = [
    new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setCustomId(confirmCustomId)
        .setEmoji("✅")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(cancelCustomId)
        .setEmoji("❎")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary),
    ]),
  ];
  return row;
};

/**
 * Use an action row to disable its buttons.
 * @param {ActionRowBuilder<ButtonBuilder>} actionRow The message or action row whose buttons you want to disable.
 * @returns {ActionRowBuilder<ButtonBuilder>}
 */
export function disableButtons(
  actionRow: ActionRowBuilder<ButtonBuilder>
): ActionRowBuilder<ButtonBuilder>;
/**
 * Use an action row array to disable its buttons.
 * @param {ActionRowBuilder<ButtonBuilder>[]} actionRows The message or action row whose buttons you want to disable.
 * @returns {ActionRowBuilder<ButtonBuilder>[]}
 */
export function disableButtons(
  actionRows: ActionRowBuilder<ButtonBuilder>[]
): ActionRowBuilder<ButtonBuilder>[];
/**
 * Use a message to disable its buttons.
 * @param {Message} message The message or action row whose buttons you want to disable.
 * @returns {Message}
 */
export function disableButtons(
  message: Message
): ActionRowBuilder<ButtonBuilder>[];
/**
 * Use a message or an action row to disable its buttons.
 * @param {Message | ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<ButtonBuilder>[]} messageOrActionRow The message or action row whose buttons you want to disable.
 * @returns {ActionRowBuilder<ButtonBuilder>[]}
 */
export function disableButtons(
  messageOrActionRow:
    | Message
    | ActionRowBuilder<ButtonBuilder>
    | ActionRowBuilder<ButtonBuilder>[]
) {
  if (messageOrActionRow instanceof Message) {
    const actionRows = messageOrActionRow.components;
    const finalActionRows: ActionRowBuilder<ButtonBuilder>[] = [];
    actionRows.forEach((actionRow) => {
      const newButtonArray: ButtonBuilder[] = [];

      const messageButtons = actionRow.components.filter(
        (component) => component.type === ComponentType.Button
      ) as ButtonComponent[];
      messageButtons.forEach((button) => {
        const newButton = ButtonBuilder.from(button);
        newButton.setDisabled(true);
        newButtonArray.push(newButton);
      });
      const newActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        newButtonArray
      );
      finalActionRows.push(newActionRow);
    });
    return finalActionRows;
  } else if (messageOrActionRow instanceof ActionRowBuilder) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      messageOrActionRow.components.map((button) => button.setDisabled(true))
    );
  } else if (messageOrActionRow instanceof Array) {
    const returnArray: ActionRowBuilder<ButtonBuilder>[] = [];
    messageOrActionRow.forEach((actionRow) => {
      actionRow.components.forEach((button) => button.setDisabled(true));
      returnArray.push(actionRow);
    });
    return returnArray;
  }
}
