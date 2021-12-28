import { AkairoMessage, Command } from "discord-akairo";
import axios from "axios";
import cachios from "cachios";
import { Message, MessageEmbed } from "discord.js";
import LinkHypixel from "../../structures/models/LinkHypixel.js";

export default class VerifyCommand extends Command {
  constructor() {
    super("verify", {
      aliases: ["verify"],
      category: "hypixel",
      description: {
        content: "Link your minecraft account to your discord",
        usage: "verify [mcname]",
        examples: ["-verify Strqtz"],
      },
      args: [
        {
          id: "mcname",
          type: "string",
          description: "Your minecraft ign",
        },
      ],
      slash: true,
      slashOptions: [
        {
          name: "mcname",
          type: "STRING",
          description: "Your minecraft ign",
        },
      ],
      cooldown: 60000,
      ratelimit: 1,
    });
  }

  /**
   * @param { Message | AkairoMessage}  message
   * @param {{mcname:string}} args
   */

  async exec(message, args) {
    let HypixelSet;
    const uuid = await cachios.get(
      "https://api.mojang.com/users/profiles/minecraft/" + args.mcname,
      {
        ttl: 10,
      }
    );
    const uuidjson = uuid.data;
    const res = await cachios.get(
      `https://api.hypixel.net/player?uuid=` +
        uuidjson.id +
        `&key=` +
        process.env.apiKey,
      {
        ttl: 60,
      }
    );
    const correct =
      res.data.player.socialMedia.links.DISCORD === message.author.tag;
    try {
      HypixelSet = await LinkHypixel.findOne({
        discordID: message.author.id,
        uuid: uuidjson.id,
      });
      if (correct) {
        if (!HypixelSet) {
          let response = await LinkHypixel.create({
            discordID: message.author.id,
            uuid: uuidjson.id,
          });
          response.save().then(() => {
            const name = new MessageEmbed()
              .setColor(this.client.colour)
              .setDescription(
                `Updated the connected account for ${message.author.username} to ${uuidjson.name}`
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
            message.util.reply({ embeds: [name], ephemeral: true });
          });
        }
      } else {
        const notEqual = new MessageEmbed()
          .setColor("FF0000")
          .setDescription(
            `The discord linked to your Hypixel account does not match your discord tag.`
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
        await message.util.reply({ embeds: [notEqual], ephemeral: true });
      }
    } catch (e) {
      message.util.reply(
        { ephemeral: true },
        `An error occured while executing this command`
      );
      this.client.logging.log("error", e);
    }
  }
}
