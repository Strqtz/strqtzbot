import { Command, Inhibitor } from "discord-akairo";
import { Message } from "discord.js";

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
   *@param {Message} message
   * @param {Command} command
   */

  async exec(message, command) {
    if (command.superUserOnly) {
      if (!client.isSuperUser(message.author)) {
        return true;
      }
    }
    return false;
  }
}
