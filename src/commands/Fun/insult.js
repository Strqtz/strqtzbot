import { AkairoMessage, Command } from "discord-akairo";
import { Message, MessageEmbed, User } from "discord.js";
import cachios from "cachios";

export default class InsultCommand extends Command {
  constructor() {
    super("insult", {
      aliases: ["insult"],
      description: {
        content: "Insulted LOL",
        usage: "insult",
        examples: ["-insult"],
      },
      args: [
        {
          id: "user",
          type: "userMention",
        },
      ],
      slash: true,
      slashOptions: [
        {
          name: "user",
          type: "USER",
          description: "A Name",
          required: false,
        },
      ],
      cooldown: 10000,
      ratelimit: 1,
    });
  }

  /**
   * @param {Message | AkairoMessage} message
   * @param {{user:User}} args
   */

  async exec(message, args) {
    const evil = await cachios.get(
      "https://evilinsult.com/generate_insult.php?lang=en&type=json",
      {
        ttl: 1,
      }
    );
    const insult = evil.data;

    if (args.user) {
      const embed = new MessageEmbed()
        .setColor(this.client.colour)
        .setDescription(insult.insult);
      await message.util.send(`${args.user}`);
      await message.util.reply({ embeds: [embed] });
    } else {
      const embed = new MessageEmbed()
        .setColor(this.client.colour)
        .setDescription(insult.insult);
      await message.util.reply({ embeds: [embed] });
    }
  }
}
