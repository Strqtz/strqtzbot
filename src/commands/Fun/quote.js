import { AkairoMessage, Command, ContextMenuCommand } from "discord-akairo";
import {
  Message,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
} from "discord.js";
import cachios from "cachios";

export default class QuoteCommand extends Command {
  constructor() {
    super("quote", {
      aliases: ["quote"],
      description: {
        content: "Get a random quote",
        usage: "quote",
        examples: ["-quote"],
      },
      slash: true,
      cooldown: 10000,
      ratelimit: 1,
    });
  }

  /**
   * @param {Message | AkairoMessage} message
   */

  async exec(message) {
    const qu = await cachios.get("https://api.quotable.io/random", {
      ttl: 1,
    });
    const quote = qu.data;

    const embed = new MessageEmbed()
      .setColor(this.client.colour)
      .setDescription(`> ${quote.content}` + "\n" + `${quote.author}`);
    await message.util.reply({ embeds: [embed] });
  }
}
