import { AkairoMessage, Command } from "discord-akairo";
import { Message } from "discord.js";

export default class RunnersBadCommnad extends Command {
  constructor() {
    super("runnersbad", {
      aliases: ["runnersbad"],
      description: {
        content: "FC on top",
        usage: "runnersbad",
        examples: ["-runnersbad"],
      },
      slash: true,
      cooldown: 1000,
      ratelimit: 1,
    });
  }

  /**
   * @param {Message| AkairoMessage} message
   */
  exec(message) {
    return message.util.reply(
      `Running Moment ` + "https://imgur.com/a/DjPne4S"
    );
  }
}
