import { Command } from "discord-akairo";

import { Message, MessageEmbed } from "discord.js";

export default class PingCommand extends Command {
  constructor() {
    super("ping", {
      aliases: ["ping", "pong"],
      category: "info",
      description: {
        content: "Shows the bot's ping",
        usage: "ping",
        examples: ["-ping"],
      },
      channel: "guild",
      cooldown: 20000,
      ratelimit: 2,
    });
  }

  /**
   * @param {Message}  message
   */

  async exec(message) {
    const embed = new MessageEmbed()
      .setColor(this.client.colour)
      .setFields({ name: "🏓 Ping: ", value: `${this.client.ws.ping}ms` })
      .setTimestamp()
      .setFooter(
        `Executed By ${message.member.displayName}`,
        message.member.user.displayAvatarURL({
          size: 64,
          format: "png",
          dynamic: true,
        })
      );
    message.util.reply({ embeds: [embed], ephemeral: true });
  }
}
