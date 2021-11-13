import { AkairoMessage, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class HelpCommand extends Command {
  constructor() {
    super("help", {
      aliases: ["help"],
      description: {
        content: "A help command",
        usage: "help [prefix]",
        examples: ["-help ping"],
      },
      category: "info",
      args: [
        {
          id: "command",
          type: "commandAlias",
          match: "content",
        },
      ],
      slash: true,
      slashOptions: [
        {
          name: "command",
          type: "STRING",
          description: "The command you need help with",
          required: true,
        },
      ],
      cooldown: 30000,
      ratelimit: 5,
    });
  }

  /**
   * @param {AkairoMessage | Message}  message
   * @param {{command:Command | string}} args
   */

  async exec(message, args) {
    function capitalize(string) {
      const str = string.toString();
      return str[0].toUpperCase() + str.slice(1).toLowerCase();
    }

    function commaSpace(string) {
      const str = string.toString();
      return str.replace(",", ", ");
    }

    const command = args.command
      ? typeof args.command === "string"
        ? client.commandHandler.modules.get(args.command) ?? null
        : args.command
      : null;
    if (command) {
      const helpEmbed = new MessageEmbed()
        .setColor(this.client.colour)
        .setTitle(capitalize(command.aliases[0]))
        .addFields(
          {
            name: `Category: `,
            value: capitalize(command.category),
          },
          {
            name: `Description: `,
            value: `${command.description.content}`,
          },
          { name: `Usage: `, value: `${command.description.usage}` },
          {
            name: `Examples: `,
            value: `${command.description.examples}`,
          },
          {
            name: `Cooldown: `,
            value: `${command.cooldown / 1000} seconds`,
          }
        )
        .setTimestamp()
        .setFooter(
          `Executed By ${message.member.displayName}`,
          message.member.user.displayAvatarURL({
            size: 64,
            format: "png",
            dynamic: true,
          })
        );
      const aliase = command.aliases;
      if (command.aliases > [1]) {
        helpEmbed.addField(`Aliases: `, commaSpace(aliase));
      }
      if (command.slash === true) {
        helpEmbed.addField(`Slash: `, `:green_circle:`);
      }
      if (command.slashOnly === true) {
        helpEmbed.addField(`Slash-only: `, `:green_circle:`);
      }
      return await message.util.reply({ embeds: [helpEmbed] });
    }
  }
}
