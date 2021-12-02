import { AkairoMessage, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import MessageExp from "../../structures/models/MessageExp.js";

export default class LevelCommand extends Command {
  constructor() {
    super("level", {
      aliases: ["level", "rank"],
      description: {
        content: "Gets yours or others chat level",
        usage: "level [user]",
        examples: ["-help ping"],
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
          description: "The user you want to find to level for",
          required: false,
        },
      ],
      cooldown: 30000,
      ratelimit: 2,
    });
  }

  /**
   * @param {Message | AkairoMessage} message
   * @param {{user:User}} args
   */

  async exec(message, args) {
    let userExist;
    const embed = new MessageEmbed()
      .setColor(this.client.colour)
      .setTimestamp()
      .setFooter(
        `Executed By ${message.member.displayName}`,
        message.member.user.displayAvatarURL({
          size: 64,
          format: "png",
          dynamic: true,
        })
      );
    if (args.user) {
      userExist = await MessageExp.findOne({
        discordID: args.user.id,
      });
      if (!userExist) {
        embed.setDescription(`${args.user} has 0 exp and is Level 0`);
      } else {
        embed.setDescription(
          `${args.user} has ${userExist.exp} exp` +
            "\n" +
            "***Their level is:*** \n" +
            `${userExist.level}`
        );
      }
      await message.util.reply({ embeds: [embed] });
    } else {
      let user = await MessageExp.findOne({
        discordID: message.author.id,
      });
      embed.setDescription(
        `You have ${user.exp} exp` +
          "\n" +
          "***Your level is:*** \n" +
          `> ${user.level}`
      );
      await message.util.reply({ embeds: [embed] });
    }
  }
}
