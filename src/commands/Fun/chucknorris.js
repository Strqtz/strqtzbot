import { AkairoMessage, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import cachios from "cachios";

export default class ChucknorrisCommand extends Command {
  constructor() {
    super("chucknorris", {
      aliases: ["chucknorris"],
      description: {
        content: "Chuck Norris Joke",
        usage: "chucknorris",
        examples: ["-chucknorris"],
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
    const chuck = await cachios.get("https://api.chucknorris.io/jokes/random", {
      ttl: 1,
    });
    const norris = chuck.data;

    const embed = new MessageEmbed()
      .setColor(this.client.colour)
      .setAuthor(
        "CHUCK NORRIS",
        norris.icon_url,
        "https://en.wikipedia.org/wiki/Chuck_Norris"
      )
      .setDescription(norris.value);
    await message.util.reply({ embeds: [embed] });
  }
}
