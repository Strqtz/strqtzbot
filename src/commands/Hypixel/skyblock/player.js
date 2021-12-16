import { Command } from "discord-akairo";
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import LilyWeight from "lilyweight";
import Humanize from "humanize-plus";
import cachios from "cachios";

export default class PlayerCommand extends Command {
  constructor() {
    super("player", {
      aliases: ["player"],
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
          required: true,
        },
      ],
      cooldown: 60000,
      ratelimit: 2,
    });
  }

  /**
   * @param {Message | AkairoMessage} message
   * @param {{ign:string}} args
   */

  async exec(message, args) {
    message.util.reply({content: "Player Viewer"})
    let page = 1;
    let pages = 3;

    function removeUnderscorePlus(string) {
      return string.replace(`_PLUS`, "+");
    }

    const skillXPPerLevel = [
      0, 50, 125, 200, 300, 500, 750, 1000, 1500, 2000, 3500, 5000, 7500, 10000,
      15000, 20000, 30000, 50000, 75000, 100000, 200000, 300000, 400000, 500000,
      600000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000,
      1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000,
      2200000, 2300000, 2400000, 2500000, 2600000, 2750000, 2900000, 3100000,
      3400000, 3700000, 4000000, 4300000, 4600000, 4900000, 5200000, 5500000,
      5800000, 6100000, 6400000, 6700000, 7000000,
    ];

    function recomb(str) {
      return str.replace("true", ":recomb:");
    }

    function getLevelFromXP(xp) {
      let xpAdded = 0;
      for (let i = 0; i < 61; i++) {
        xpAdded += skillXPPerLevel[i];
        if (xp < xpAdded)
          return Math.floor(
            i - 1 + (xp - (xpAdded - skillXPPerLevel[i])) / skillXPPerLevel[i]
          );
      }

      return 60;
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

    const getActiveProfile = function (profiles, uuid) {
      return profiles.sort(
        (a, b) => b.members[uuid].last_save - a.members[uuid].last_save
      )[0];
    };

    const lilyweight = new LilyWeight(process.env.apiKey);

    if (args.ign.length > 16) return;

    const uuidreq = await cachios.get(
      `https://api.mojang.com/users/profiles/minecraft/${args.ign}`,
      { ttl: 120 }
    );
    const uuiddata = uuidreq.data;

    const profiles = await cachios.get(
      `https://api.hypixel.net/skyblock/profiles?key=${process.env.apiKey}&uuid=${uuiddata.id}`,
      { ttl: 60 }
    );

    if (uuidreq && profiles.data.profiles !== null) {
      const friendsreq = await cachios.get(
        `https://api.hypixel.net/friends?key=` +
          process.env.apiKey +
          "&uuid=" +
          uuiddata.id,
        { ttl: 60 }
      );

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

      const response = await cachios.post(
        "https://nariah-dev.com/api/networth/categories",
        { data: profile },
        { ttl: 60 }
      );

      const res = response.data.data;

      const embed = new MessageEmbed()
        .setThumbnail(
          `https://crafatar.com/avatars/${uuiddata.id}?size=32&overlay&default=717eb72c52024fbaa91a3e61f34b3b58`
        )
        .setDescription(
          `${uuiddata.name} has **${friendsdata.records.length}** friends.`
        )
        .setFooter(`Page ${page}/${pages}`);

      let components;

      components = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("backpage")
          .setEmoji("◀")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setCustomId("forwardpage")
          .setEmoji("▶")
          .setStyle("PRIMARY"),
      ]);

      profile.banking = activeProfile.banking;

      const filter = (i) =>
        i.customId === "forwardpage" && i.message.id === message.id;

      const collector = message.createMessageComponentCollector({
        filter: filter,
        time: 30000,
        componentType: "BUTTON",
      });

      collector.on("collect", async (i) => {
        if (i.customId === "forwardpage") {
          if (page === pages) return;
          page++;
        }
      });

      const filter2 = (i) =>
        i.customId === "backpage" && i.message.id === message.id;

      const collector2 = message.createMessageComponentCollector({
        filter: filter2,
        time: 30000,
        componentType: "BUTTON",
      });

      collector2.on("collect", async (i) => {
        if (i.customId === "backpage") {
          if (page === 1) return;
          page--;
        }
      });

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
      if (playerdata.player.rank) {
        embed.setTitle(`[${playerdata.player.rank}] ${uuiddata.name}`);
      } else if (!playerdata.player.monthlyPackageRank === "NONE") {
        embed.setTitle(`[MVP++] ${uuiddata.name}`);
      } else if (playerdata.player.newPackageRank) {
        embed.setTitle(
          "[" +
            removeUnderscorePlus(playerdata.player.newPackageRank) +
            `] ${uuiddata.name}`
        );
      } else {
        embed.setTitle(`${uuiddata.name}`);
      }
      if (page === 1) {
        await lilyweight.getWeight(uuiddata.id).then((weight) => {
          embed.addField(
            `Weight:`,
            Humanize.formatNumber(weight.total.toString(), 2)
          );
        });
        embed.addField(`Skill Average:`, `${sa}`);
        embed.addField(
          `Networth:`,
          "$" + Humanize.formatNumber(res.networth + res.purse + res.bank, 2)
        );
        await message.util.send({ embeds: [embed], components: [components] });
      } else if (page === 2) {
        await lilyweight.getWeight(uuiddata.id).then((weight) => {
          embed
            .setFields(
              {
                name: "Catacombs Exp Weight",
                value: `${Humanize.formatNumber(
                  weight.catacombs.experience,
                  2
                )}`,
              },
              {
                name: "Base Skill Weight",
                value: `${Humanize.formatNumber(weight.skill.base, 2)}`,
              },
              {
                name: "Overflow Skill Weight",
                value: `${Humanize.formatNumber(weight.skill.overflow, 2)}`,
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
        await message.util.edit({ embeds: [embed], components: [components] });
      } else if (page === 3) {
        embed
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
          .setDescription(`${sa}`);
        await message.util.edit({ embeds: [embed], components: [components] });
      }
    } else if (profiles.data.profiles == null) {
      await message.util.reply(`This player has never played Skyblock before.`);
    } else if (!uuiddata) {
      await message.util.reply(`This player doesn't exist.`);
    }
  }
}
