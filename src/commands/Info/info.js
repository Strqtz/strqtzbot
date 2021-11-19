import { AkairoMessage, Command } from "discord-akairo";

import { Message, MessageEmbed } from "discord.js";

import si from "systeminformation";

export default class InfoCommand extends Command {
  constructor() {
    super("info", {
      aliases: ["info"],
      description: {
        content: "Shows information about the discord bot",
        usage: "info",
        examples: ["-info"],
      },
      channel: "guild",
      slash: true,
      cooldown: 20000,
      ratelimit: 2,
    });
  }

  /**
   * @param { Message | AkairoMessage}  message
   */

  async exec(message) {
    const embed = new MessageEmbed()
      .setColor(this.client.colour)
      .addFields({
        name: "Ping: ",
        value: `${this.client.ws.ping}ms`,
        inline: true,
      })
      .setTimestamp()
      .setFooter(
        `Executed By ${message.member.displayName}`,
        message.member.user.displayAvatarURL({
          size: 64,
          format: "png",
          dynamic: true,
        })
      );

    const os = await si.osInfo();

    const dataCpu = await si.cpu();
    embed.addFields(
      {
        name: "Platform:",
        value: `${os.platform}, ${os.kernel}`,
        inline: true,
      },
      {
        name: "Uptime:",
        value: `${Math.round(si.time().uptime)} seconds`,
        inline: true,
      },
      {
        name: "CPU Type:",
        value: `${dataCpu.manufacturer}, ${dataCpu.brand}`,
        inline: true,
      },
      {
        name: "CPU Cores:",
        value: `${dataCpu.cores}`,
        inline: true,
      },
      {
        name: "CPU Clock Speeds:",
        value: `${dataCpu.speed} Min: ${dataCpu.speedMin} GHz, Max: ${dataCpu.speedMax} GHz`,
        inline: true,
      }
    );
    await message.util.reply({ embeds: [embed], ephemeral: true });
  }
}
