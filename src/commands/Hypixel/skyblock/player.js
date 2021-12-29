import { AkairoMessage, Command } from "discord-akairo";
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageComponentInteraction,
} from "discord.js";
import LilyWeight from "lilyweight";
import Humanize from "humanize-plus";
import cachios from "cachios";
import { pagination, paginationEmbed } from "../../../libs/pagination.js";
import {
  getLevelFromXP,
  removeUnderscorePlus,
  getActiveProfile,
  ObjectLength,
} from "../../../structures/Constants/constants.js";
import wait from "wait";
import LinkHypixel from "../../../structures/models/LinkHypixel.js";

export default class PlayerCommand extends Command {
  constructor() {
    super("player", {
      aliases: ["player", "pv", "playerviewer"],
      description: {
        content: "Shows information about the player's skyblock profile",
        usage: "player <player>",
        examples: ["-player Strqtz"],
      },
      args: [
        {
          id: "ign",
          type: "string",
          description: "A players in-game name",
        },
      ],
      channel: "all",
      slash: true,
      slashOptions: [
        {
          name: "ign",
          type: "STRING",
          description: "A players in-game name",
          required: false,
        },
      ],
      cooldown: 60000,
      ratelimit: 2,
    });
  }

  page = 0;
  buttons;
  embeds;
  emojis;

  /**
   * @param {Message | AkairoMessage} message
   * @param {{ign:string}} args
   */

  async exec(message, args) {
    function recomb(str) {
      return str.replace("true", ":recomb:");
    }

    function getSA(
      farming,
      mining,
      combat,
      foraging,
      fishing,
      enchanting,
      alchemy,
      taming
    ) {
      let skilla =
        (farming +
          mining +
          combat +
          foraging +
          fishing +
          enchanting +
          alchemy +
          taming) /
        8;
      if (skilla > 55) {
        const totake = skilla - 55;
        return skilla - totake;
      }
      return skilla;
    }

    const lilyweight = new LilyWeight(process.env.apiKey);

    try {
      let name;
      name = await LinkHypixel.findOne({
        discordID: message.author.id,
      });
      if (!name) {
        await message.util.reply({
          content:
            "Link your Minecraft Account to the discord bot using `/verify [YOUR IGN]`",
        });
      }
      let uuidreq;
      if (!args.ign) {
        uuidreq = await cachios.get(
          `https://sessionserver.mojang.com/session/minecraft/profile/${name.get(
            "uuid"
          )}`,
          { ttl: 120 }
        );
      } else if (args.ign) {
        if (args.ign.length > 16) return message.util.reply("Invalid Name");
        uuidreq = await cachios.get(
          `https://api.mojang.com/users/profiles/minecraft/${args.ign}`,
          { ttl: 120 }
        );
      }
      const uuiddata = uuidreq.data;
      const msg = await message.util.reply({
        content: "Profile Viewer for " + uuiddata.name,
      });

      const profiles = await cachios.get(
        `https://api.hypixel.net/skyblock/profiles?key=${process.env.apiKey}&uuid=${uuiddata.id}`,
        { ttl: 60 }
      );
      const profilesdata = profiles.data;

      if (uuidreq && profiles.data.profiles !== null) {
        const friendsreq = await cachios.get(
          `https://api.hypixel.net/friends?key=` +
            process.env.apiKey +
            "&uuid=" +
            uuiddata.id,
          { ttl: 60 }
        );

        const response = await cachios.post(
          `http://hypixelskyblock.superbonecraft.dk:8000/total/${uuiddata.id}`,
          profilesdata,
          { ttl: 60 }
        );

        const responsepages = await cachios.post(
          `http://hypixelskyblock.superbonecraft.dk:8000/pages/${uuiddata.id}`,
          profilesdata,
          { ttl: 60 }
        );

        console.log(responsepages.data.storage.prices);

        const friendsdata = friendsreq.data;

        const playerreq = await cachios.get(
          `https://api.hypixel.net/player?key=` +
            process.env.apiKey +
            "&uuid=" +
            uuiddata.id,
          { ttl: 60 }
        );

        const activeProfile = getActiveProfile(
          profiles.data.profiles,
          uuiddata.id
        );

        const profile = activeProfile.members[uuiddata.id];

        const playerdata = playerreq.data;

        const embed = new MessageEmbed().setDescription(
          `${uuiddata.name} has **${friendsdata.records.length}** friends.`
        );
        const embed2 = new MessageEmbed();
        const embed3 = new MessageEmbed();
        const embed4 = new MessageEmbed();

        const button1 = new MessageButton()
          .setLabel("<=")
          .setCustomId("backbtn")
          .setStyle("DANGER");
        const button2 = new MessageButton()
          .setLabel("=>")
          .setCustomId("nxtbutton")
          .setStyle("SUCCESS");

        this.embeds = [embed, embed2, embed3, embed4];

        this.buttons = [button1, button2];

        profile.banking = activeProfile.banking;
        if (!profile.banking)
          return await message.util.reply(
            "<:error:923018104303415326>This command failed, probably because this player has their API off."
          );
        const sa = Humanize.formatNumber(
          getSA(
            getLevelFromXP(profile.experience_skill_farming),
            getLevelFromXP(profile.experience_skill_mining),
            getLevelFromXP(profile.experience_skill_combat),
            getLevelFromXP(profile.experience_skill_foraging),
            getLevelFromXP(profile.experience_skill_fishing),
            getLevelFromXP(profile.experience_skill_enchanting),
            getLevelFromXP(profile.experience_skill_alchemy),
            getLevelFromXP(profile.experience_skill_taming)
          ),
          2
        );
        for (let i = 0; i < ObjectLength(this.embeds); i++) {
          if (playerdata.player.rank) {
            this.embeds[i].setTitle(
              `[${playerdata.player.rank}] ${uuiddata.name}`
            );
          } else if (!playerdata.player.monthlyPackageRank === "NONE") {
            this.embeds[i].setTitle(`[MVP++] ${uuiddata.name}`);
          } else if (playerdata.player.newPackageRank) {
            this.embeds[i].setTitle(
              "[" +
                removeUnderscorePlus(playerdata.player.newPackageRank) +
                `] ${uuiddata.name}`
            );
          } else {
            this.embeds[i].setTitle(`${uuiddata.name}`);
          }
          this.embeds[i].setThumbnail(
            `https://crafatar.com/avatars/${uuiddata.id}?size=32&overlay&default=717eb72c52024fbaa91a3e61f34b3b58`
          );
        }

        try {
          await lilyweight.getWeight(uuiddata.id).then((weight) => {
            embed.addField(
              `Weight:`,
              Humanize.formatNumber(weight.total.toString(), 2)
            );
          });
          embed.addField(`Skill Average:`, `${sa}`);
          embed.addField(
            `Networth:`,
            "$" + Humanize.formatNumber(response.data.total, 2)
          );
        } catch (e) {
          console.error(e);
          await message.util.reply(
            "<:error:923018104303415326>This command failed, probably because this player has their banking API off."
          );
        }

        await lilyweight.getWeight(uuiddata.id).then((weight) => {
          embed2
            .setFields(
              {
                name: "Base Skill Weight",
                value: `${Humanize.formatNumber(weight.skill.base, 2)}`,
              },
              {
                name: "Overflow Skill Weight",
                value: `${Humanize.formatNumber(weight.skill.overflow, 2)}`,
              },
              {
                name: "Catacombs Exp Weight",
                value: `${Humanize.formatNumber(
                  weight.catacombs.experience,
                  2
                )}`,
              },
              {
                name: "Slayer Weight",
                value: `${Humanize.formatNumber(weight.slayer, 2)}`,
              }
            )
            .setDescription(
              `${uuiddata.name} has **${Humanize.formatNumber(
                weight.total,
                2
              )}** weight.`
            );
        });
        embed3
          .setFields(
            {
              name: "Farming Level",
              value: `${Humanize.formatNumber(
                getLevelFromXP(profile.experience_skill_farming),
                2
              )}`,
            },
            {
              name: "Mining Level",
              value: `${Humanize.formatNumber(
                getLevelFromXP(profile.experience_skill_mining),
                2
              )}`,
            },
            {
              name: "Combat Level",
              value: `${Humanize.formatNumber(
                getLevelFromXP(profile.experience_skill_combat),
                2
              )}`,
            },
            {
              name: "Foraging Level",
              value: `${Humanize.formatNumber(
                getLevelFromXP(profile.experience_skill_foraging),
                2
              )}`,
            },
            {
              name: "Fishing Level",
              value: `${Humanize.formatNumber(
                getLevelFromXP(profile.experience_skill_fishing),
                2
              )}`,
            },
            {
              name: "Enchanting Level",
              value: `${Humanize.formatNumber(
                getLevelFromXP(profile.experience_skill_enchanting),
                2
              )}`,
            },
            {
              name: "Taming Level",
              value: `${Humanize.formatNumber(
                getLevelFromXP(profile.experience_skill_taming),
                2
              )}`,
            },
            {
              name: "Alchemy Level",
              value: `${Humanize.formatNumber(
                getLevelFromXP(profile.experience_skill_alchemy),
                2
              )}`,
            }
          )
          .setDescription(`**Skill Average:** ${sa}`);

        
          await pagination(msg, this.embeds, this.buttons, 30000);
      }
    } catch (e) {
      console.error(e);
      await message.util.reply(
        "<:error:923018104303415326>This command failed, probably because this player has their API off."
      );
    }
  }
}
