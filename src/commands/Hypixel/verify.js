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
    HypixelSet = await LinkHypixel.findOne({
      discordID: message.author.id,
    });
    if (!args.mcname) {
      if (HypixelSet) {
        let uuidreq = await cachios.get(
          `https://sessionserver.mojang.com/session/minecraft/profile/${HypixelSet.get(
            "uuid"
          )}`,
          { ttl: 120 }
        );
        const embed = new MessageEmbed()
          .setDescription(
            "Your linked Minecraft account is " + uuidreq.data.name
          )
          .setThumbnail(
            `https://crafatar.com/avatars/${uuidreq.data.id}?size=32&overlay&default=717eb72c52024fbaa91a3e61f34b3b58`
          );
        return await message.util.reply({ embeds: [embed] });
      } else if (!HypixelSet) {
        return await message.util.reply(
          "Please link your account using `/verify <ign>`."
        );
      }
    }
    const uuid = await cachios.get(
      "https://api.mojang.com/users/profiles/minecraft/" + args.mcname,
      {
        ttl: 60,
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
      const msg = message.util.reply(
        "Linking your account <a:loading:928083841514614795>"
      );
      if (correct) {
        if (!HypixelSet) {
          let response = await LinkHypixel.create({
            discordID: message.author.id,
            uuid: uuidjson.id,
          });
          response.save().then(async () => {
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
            return await message.util.reply({
              embeds: [name],
              ephemeral: true,
            });
          });
        } else if (HypixelSet) {
          return await message.util.reply({
            content: "You're already linked lol.",
            ephemeral: true,
          });
        }
      } else {
        const notEqual = new MessageEmbed()
          .setColor("FF0000")
          .setDescription(
            `The discord linked to your Hypixel account does not match your discord tag. Look below for instructions on how to link your Discord to Hypixel.`
          )
          .setImage("https://imgur.com/a/Z4Lf8qn")
          .setTimestamp()
          .setFooter(
            `Help video stolen from Necron/FPF`,
            message.member.user.displayAvatarURL({
              size: 64,
              format: "png",
              dynamic: true,
            })
          );
        return await message.util.reply({
          embeds: [notEqual],
          ephemeral: true,
        });
      }
    } catch (e) {
      this.client.logging.log("error", e);
      return message.util.reply(
        { ephemeral: true },
        `An error occured while executing this command`
      );
    }
  }
}
