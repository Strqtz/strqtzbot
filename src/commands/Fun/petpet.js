import { AkairoMessage, Command } from "discord-akairo";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import petpetGif from "pet-pet-gif";
import * as fs from "fs";

export default class PetpetCommand extends Command {
  constructor() {
    super("petpet", {
      aliases: ["petpet"],
      description: {
        content: "Creates a petpet gif of your pfp or an image",
        usage: "petpet [img]",
        examples: [
          "-petpet https://cdn.discordapp.com/avatars/872640237430505602/28d89a1426c99e736967f77f3e60b398.png?size=2048",
        ],
      },
      args: [
        {
          id: "image",
          type: "string",
          description: "An image",
        },
      ],
      channel: "all",
      slash: true,
      slashOptions: [
        {
          name: "image",
          type: "STRING",
          description: "An image",
          required: false,
        },
      ],
      cooldown: 60000,
      ratelimit: 2,
    });
  }

  /**
   * @param {Message | AkairoMessage} message
   * @param {{image:string}} args
   */

  async exec(message, args) {
     function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return this.client.users.cache.get(mention);
	}
    }
    let gif;
    if (!args.image) {
      gif = await petpetGif(
        message.author.avatarURL({ size: 512, format: "png", dynamic: true })
      );
    } else if (args.image) {
      if (args.image.includes("<@")) {
        gif = await petpetGif(
        getUserFromMention(args.ign).avatarURL({ size: 512, format: "png", dynamic: true }));
      } else {
      gif = await petpetGif(args.image);
      }
    }
    fs.writeFile("petpet.gif", gif, function (err) {
      console.log(err);
    });
    const attachment = new MessageAttachment("petpet.gif", "petpet.gif");
    return await message.util.reply({ files: [attachment] });
  }
}
