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
    const mem = await si.mem();
    const os = await si.osInfo();
    const cpu = await si.cpu();
    const time = si.time().timezoneName;
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
    embed.addFields(
      {
        name: "Uptime:",
        value: `${Math.round(process.uptime())} seconds`,
        inline: true,
      },
      {
        name: "Platform:",
        value: `${os.platform}, ${os.kernel}`,
        inline: true,
      },
      {
        name: "CPU Speed:",
        value: `${cpu.speed} GHz`,
        inline: true,
      },
      {
        name: "Local Server Timezone:",
        value: `${time}`,
        inline: true,
      }
    );
    await message.util.reply({ embeds: [embed], ephemeral: true });
  }
}
