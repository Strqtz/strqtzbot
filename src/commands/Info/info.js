import { AkairoMessage, Command } from "discord-akairo";
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";

export default class InfoCommand extends Command {
  constructor() {
    super("info", {
      aliases: ["info"],
      description: {
        content:
          "Shows information and credits to API's and more, that contributed to the development of this bot!",
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
   * @param {Message | AkairoMessage} message
   */

  async exec(message) {
    const embed = new MessageEmbed().setTitle("Bot Credits").setTimestamp();
    embed.setDescription(
      "Created with [Discord Akairo](https://discord.gg/PDkYeSZnmS) and [Discord.js](https://discord.gg/djs).\n Minecraft Avatar's supplied by [Crafatar](https://crafatar.com/) and [MCHeads](https://mc-heads.net/). Skyblock Item Emojis by [Altpapier](https://discord.com/invite/fd4Be4W). Weight Calculations by [Senither](https://hypixel-api.senither.com/). Networth Calculations created by [Nariah](https://discord.gg/4K5bgbvHdj) and hosted by [SkyBrokers](https://discord.gg/ssb)."
    );
    const components = new MessageActionRow().addComponents(
      new MessageButton()
        .setStyle("LINK")
        .setLabel("Github Repo")
        .setURL("https://github.com/Strqtz/strqtzbot"),
      new MessageButton()
        .setStyle("LINK")
        .setLabel("StopThrowing")
        .setURL("https://discord.gg/R8sxj8ZJns")
    );
    return await message.util.reply({
      embeds: [embed],
      components: [components],
    });
  }
}
