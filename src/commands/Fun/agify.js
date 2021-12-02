import { AkairoMessage, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import cachios from "cachios";

export default class AgifyCommand extends Command {
  constructor() {
    super("agify", {
      aliases: ["agify"],
      description: {
        content: "Get Any Names Predicted Age",
        usage: "agify Walter",
        examples: ["-agify Walter"],
      },
      args: [
        {
          id: "name",
          type: "string",
          description: "A Name",
        },
      ],
      slash: true,
      slashOptions: [
        {
          name: "name",
          type: "STRING",
          description: "A Name",
          required: true,
        },
      ],
      cooldown: 60000,
      ratelimit: 1,
    });
  }

  /**
   * @param {Message | AkairoMessage} message
   * @param{{name:string}} args
   */

  async exec(message, args) {
    const name = await cachios.get("https://api.agify.io/?name=" + args.name, {
      ttl: 60,
    });
    const agedata = name.data;

    const embed = new MessageEmbed()
      .setColor(this.client.colour)
      .addFields(
        { name: "Name: ", value: `${agedata.name}`, inline: true },
        { name: "Age: ", value: `${agedata.age}`, inline: true }
      );
    await message.util.reply({ embeds: [embed] });
  }
}
