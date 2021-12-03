import { AkairoMessage, Command, Inhibitor } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class SuperUser extends Inhibitor {
  constructor() {
    super("ownerOnly", {
      reason: "ownerOnly",
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
    if (command.ownerOnly) {
      if (!this.client.isOwner(message.author)) {
        return true;
      }
    }
    return false;
  }
}
