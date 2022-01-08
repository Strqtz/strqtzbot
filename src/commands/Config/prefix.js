import { AkairoMessage, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import Prefix from "../../structures/models/Prefix.js";

export default class PrefixCommand extends Command {
  constructor() {
    super("prefix", {
      aliases: ["prefix"],
      category: "config",
      description: {
        content: "Change the bots prefix in your server",
        usage: "prefix [prefix]",
        examples: ["-prefix !"],
      },
      args: [
        {
          id: "prefix",
          type: "string",
        },
      ],
      slash: true,
      slashOptions: [
        {
          name: "prefix",
          type: "STRING",
          description: "Your new prefix",
        },
      ],
      channel: "guild",
      cooldown: 30000,
      userPermissions: ["BAN_MEMBERS"],
    });
  }

  /**
   * @param { Message | AkairoMessage}  message
   * @param {{prefix:string}} args
   */

  async exec(message, args) {
    let prefixSet;
    let prefixGuild;
    try {
      prefixSet = await Prefix.findOne({
        guildID: message.guildId,
        guildPrefix: args.prefix,
      });
      const prefixEmpty = "" || null;
      if (args.prefix && !prefixSet && !prefixEmpty) {
        const prefixUpdate = await Prefix.findOneAndUpdate(
          {
            guildID: message.guildId,
          },
          {
            guildPrefix: args.prefix,
          }
        ).then(() => {
          const setPrefix = new MessageEmbed()
            .setColor(this.client.colour)
            .setDescription(
              `Set the prefix for ${message.guild} to ${args.prefix}`
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
          message.util.reply({ embeds: [setPrefix] });
          this.client.logging.log(
            "info",
            `${message.author.username} changed the prefix to [${args.prefix}] in ${message.guild.name}`
          );
        });
      } else {
        const setPrefixAlready = new MessageEmbed()
          .setColor(this.client.colour)
          .setDescription(`Please add the prefix you want to change to.`)
          .setTimestamp()
          .setFooter(
            `Executed By ${message.member.displayName}`,
            message.member.user.displayAvatarURL({
              size: 64,
              format: "png",
              dynamic: true,
            })
          );
        await message.util.reply({ embeds: [setPrefixAlready] });
      }
    } catch (e) {
      message.util.reply(`There was an error executing this command.`, {
        ephemeral: true,
      });
      this.client.logging.log("error", e);
    }
  }
}
