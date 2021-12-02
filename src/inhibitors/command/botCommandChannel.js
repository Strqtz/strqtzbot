import { AkairoMessage, Command, Inhibitor } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class BotCommandChannelInhibitor extends Inhibitor {
  constructor() {
    super("botCommand", {
      reason: "botCommand",
      category: "command",
      type: "post",
      priority: 10,
    });
  }

  /**
   *@param {Message | AkairoMessage} message
   * @param {Command} command
   */

  async exec(message, command) {}
}
