import { AkairoMessage, Command } from "discord-akairo";
import { Channel, Message, MessageEmbed, User } from "discord.js";
import GuildSetting from "../../structures/models/GuildSettings.js";
import guildSettings from "../../structures/models/GuildSettings.js";

export default class RepCommand extends Command {
  constructor() {
    super("settings", {
      aliases: ["settings"],
      slash: true,
      slashOnly: true,
      slashOptions: [
        {
          name: "logging",
          description: "Change the guild rep settings",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"],
              description: "The logging channel for rep things.",
              required: true,
            },
          ],
        },
        {
          name: "prefix",
          description: "Change the bots prefix in your server",
          type: "SUB_COMMAND",
          options: [
            {
              name: "prefix",
              type: "STRING",
              description: "The new prefix to change to",
              required: false,
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {Message | AkairoMessage} message
   * @param {{subcommand;channel:Channel;prefix:string}} args
   */

  async exec(message, args) {
    try {
      let gsettings;
      gsettings = await GuildSetting.findOne({ guildID: message.guildId });
      switch (args.subcommand) {
        case "logging":
          if (
            !this.client.guilds.cache
              .get(message.guildId)
              .members.cache.get(message.author.id)
              .permissions.has("ADMINISTRATOR", true)
          ) {
            return message.util.reply({
              content: `You do not have the valid permissions to do this!`,
              ephemeral: true,
            });
          }
          if (!gsettings) {
            const save = await GuildSetting.create({
              guildID: message.guildId,
              loggingChannel: args.channel.id,
            });
            await save.save().then(() => {
              return message.util.reply({
                content: `Set the logging channel for ${message.guild.name}, ID [${args.channel.id}]!`,
                ephemeral: true,
              });
            });
          } else {
            await GuildSetting.findOneAndUpdate(
              { guildID: message.guildId },
              { loggingChannel: args.channel.id }
            );
            return message.util.reply({
              content: `Updated Guild Settings for ${message.guild.name}!`,
              ephemeral: true,
            });
          }
          break;
        case "prefix":
          if (
            this.client.guilds.cache
              .get(message.guildId)
              .members.cache.get(message.author.id)
              .permissions.has("ADMINISTRATOR")
          ) {
            let prefixSet;
            let prefixGuild;
            try {
              prefixSet = await GuildSetting.findOne({
                guildID: message.guildId,
                prefix: args.prefix,
              });
              const prefixEmpty = "" || null;
              if (args.prefix && !prefixSet && !prefixEmpty) {
                const prefixUpdate = await GuildSetting.findOneAndUpdate(
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
                  .setDescription(
                    `Please add the prefix you want to change to.`
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
                await message.util.reply({ embeds: [setPrefixAlready] });
              }
            } catch (e) {
              message.util.reply(`There was an error executing this command.`, {
                ephemeral: true,
              });
              this.client.logging.log("error", e);
            }
          } else {
            console.log(message.author.username);
            return message.util.reply({
              content:
                'You do not have the valid permissions `"ADMINISTRATOR"`',
            });
          }
          break;
      }
    } catch (e) {
      console.log(e);
    }
  }
}
