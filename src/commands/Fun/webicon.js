import { AkairoMessage, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class WebIconCommand extends Command {
  constructor() {
    super("webicon", {
      aliases: ["webicon", "iconsite"],
      description: {
        content: "Get Any Websites Icon",
        usage: "webicon [website]",
        examples: ["-webicon strqtz.github.io"],
      },
      args: [
        {
          id: "site",
          type: "string",
          description: "A Website",
        },
      ],
      slash: true,
      slashOptions: [
        {
          name: "site",
          type: "STRING",
          description: "A website",
        },
      ],
      cooldown: 60000,
      ratelimit: 1,
    });
  }

  /**
   * @param {Message | AkairoMessage} message
   * @param{{site:string}} args
   */

  exec(message, args) {
    const website = "https://icon.horse/icon/" + args.site;
    message.util.reply(website);
  }
}
