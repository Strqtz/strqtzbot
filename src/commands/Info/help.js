const { Command, AkairoMessage } = require("discord-akairo");
const { Message, MessageEmbed } = require("discordjs");
const winston = require("winston");

class HelpCommand extends Command {
  constructor() {
    super("help", {
      aliases: ["help", "h"],
      category: "info",
      description: [
        {
          content: "A help command",
          usage: `help [command]`,
          examples: [`-help prefix`],
        },
      ],
      args: [
        {
          id: "command",
          type: "string",
        },
      ],
      slash: true,
      slashOptions: [
        {
          name: "help",
          description: "A help command",
          type: "STRING",
          required: false,
        },
      ],
      cooldown: 20000,
    });
  }

  /**
   *@param {AkairoMessage | Message}  message
   * @param {{command:string}} args
   */
  async exec(message, args) {
    const colour = Math.floor(Math.random() * 16777215).toString(16);
    try {
      if (!args.command) {
        const antiCommand = new MessageEmbed()
          .setColor(colour)
          .setDescription(`No command`)
          .setTimestamp()
          .setFooter(
            `Executed By ${message.member.displayName}`,
            message.member.user.displayAvatarURL({
              size: 64,
              format: "png",
              dynamic: true,
            })
          );
        await message.util.reply({ embeds: [antiCommand] });
      }
    } catch (e) {
      winston.log("error", e);
    }
  }
}
module.exports = HelpCommand;
