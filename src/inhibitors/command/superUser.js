import { AkairoMessage, Command, Inhibitor } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class SuperUser extends Inhibitor {
  constructor() {
    super("superUser", {
      reason: "superUser",
      category: "command",
      type: "post",
      priority: 20,
    });
  }

  /**
   *@param {Message | AkairoMessage} message
   * @param {Command} command
   */

  async exec(message, command) {
    if (command.superUserOnly) {
      if (!this.client.isSuperUser(message.author)) {
        return true;
      }
    }
    return false;
  }
}
