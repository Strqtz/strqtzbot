import { AkairoMessage, Command } from "discord-akairo";

import { Message, User } from "discord.js";
import cachios from "cachios";
import { mc } from "../../index.js";
import LinkHypixel from "../../structures/models/LinkHypixel";

export default class GuildinviteCommand extends Command {
  constructor() {
    super("guildinvite", {
      aliases: ["guildinvite", "ginvite"],
      description: {
        content: "Shows information about the discord bot",
        usage: "info",
        examples: ["-info"],
      },
      channel: "guild",
      args: [
        {
          id: "member",
          type: "userMention",
          description: "A discord member of the StopThrowing Guild",
        },
      ],
      ownerOnly: true,
      cooldown: 120000,
      ratelimit: 1,
    });
  }

  /**
   * @param {Message} message
   * @param {{member:User}} args
   */

  async exec(message, args) {
    let discordMember = await LinkHypixel.find({ discordID: args.member.id });
    if (!discordMember)
      return message.util.reply(
        `This user hasn't verified! ${args.member} please do \`/verify <YOUR IGN>\``
      );
    if (discordMember) {
      const uuidb4data = await cachios.get(
        `https://sessionserver.mojang.com/session/minecraft/profile/${discordMember.get(
          "uuid"
        )}`,
        {
          ttl: 60,
        }
      );
      const uuid = uuidb4data.data;

      mc.chat(`/g invite ${uuid.name}`);
      return message.util.reply(
        args.member +
          "You have been invited to join Stop Throwing, you will soon see an invite. Please run `/g accept StopThrowing`"
      );
    }
  }
}
