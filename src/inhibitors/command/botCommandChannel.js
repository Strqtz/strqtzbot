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

  async exec(message, command) {
    let botchannels = [
      "902852076864929793",
      "909713781205135380",
    ];
    if (botchannels.includes(message.channel.id)) {
      return true;
    } else {
      return false;
    }
  }
}
