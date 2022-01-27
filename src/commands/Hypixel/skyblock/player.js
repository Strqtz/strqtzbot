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
import { json } from "express";

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

    function splitTime(unixtime) {
      const unixString = unixtime.toString();
      return unixString.substr(0, unixString.length - 3);
    }

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

        const senitherreq = await cachios.get(
          `https://hypixel-api.senither.com/v1/profiles/${uuiddata.id}/last_save_at?key=${process.env.apiKey}`,
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

        let response;

        profile.banking = activeProfile.banking;

        try {
          response = await cachios.post(
            `https://maro.skybrokers.xyz/api/networth/categories`,
            { data: profile },
            { ttl: 60 }
          );
        } catch (e) {
          console.error(e);
        }

        const res = response.data.data;

        console.log(res.categories.storage.top_items[0].count);

        const playerdata = playerreq.data;

        const time = splitTime(profile.last_save);

        const emojis = await cachios.get(
          "https://raw.githubusercontent.com/Altpapier/Skyblock-Item-Emojis/main/emojis.json",
          { ttl: 60000 }
        );

        const embed = new MessageEmbed().setDescription(
          `${uuiddata.name} last played <t:${time}:R>. ${uuiddata.name} has **${friendsdata.records.length}** friends.`
        );
        const embed2 = new MessageEmbed();
        const embed3 = new MessageEmbed();

        const button1 = new MessageButton()
          .setLabel("<=")
          .setCustomId("backbtn")
          .setStyle("DANGER");
        const button2 = new MessageButton()
          .setLabel("=>")
          .setCustomId("nxtbutton")
          .setStyle("SUCCESS");

        this.embeds = [embed, embed2, embed3];

        this.buttons = [button1, button2];

        const sa = Humanize.formatNumber(
          senitherreq.data.data.skills.average_skills,
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
          embed.addField(
            `Senither Weight:`,
            Humanize.formatNumber(
              senitherreq.data.data.weight +
                senitherreq.data.data.weight_overflow,
              2
            )
          );
          embed.addField(`Skill Average:`, sa);
          embed.addField(
            `Networth:`,
            "$" + Humanize.formatNumber(res.networth + res.bank + res.purse, 2)
          );
        } catch (e) {
          console.error(e);
        }

        embed2
          .setFields(
            {
              name: `<:berserk:924858459256660069> Skill Weight _(${Humanize.formatNumber(
                senitherreq.data.data.skills.weight +
                  senitherreq.data.data.skills.weight_overflow,
                2
              )} weight)_ :`,
              value:
                `**Farming** _(${Humanize.formatNumber(
                  senitherreq.data.data.skills.farming.weight +
                    senitherreq.data.data.skills.farming.weight_overflow,
                  2
                )} weight)_ → Level ` +
                Humanize.formatNumber(
                  senitherreq.data.data.skills.farming.level,
                  2
                ) +
                "\n" +
                `**Mining** _(${Humanize.formatNumber(
                  senitherreq.data.data.skills.mining.weight +
                    senitherreq.data.data.skills.mining.weight_overflow,
                  2
                )} weight)_ → Level ` +
                Humanize.formatNumber(
                  senitherreq.data.data.skills.mining.level,
                  2
                ) +
                "\n" +
                `**Combat** _(${Humanize.formatNumber(
                  senitherreq.data.data.skills.combat.weight +
                    senitherreq.data.data.skills.combat.weight_overflow,
                  2
                )} weight)_ → Level ` +
                Humanize.formatNumber(
                  senitherreq.data.data.skills.combat.level,
                  2
                ) +
                "\n" +
                `**Foraging** _(${Humanize.formatNumber(
                  senitherreq.data.data.skills.foraging.weight +
                    senitherreq.data.data.skills.foraging.weight_overflow,
                  2
                )} weight)_ → Level ` +
                Humanize.formatNumber(
                  senitherreq.data.data.skills.foraging.level,
                  2
                ) +
                "\n" +
                `**Fishing** _(${Humanize.formatNumber(
                  senitherreq.data.data.skills.fishing.weight +
                    senitherreq.data.data.skills.fishing.weight_overflow,
                  2
                )} weight)_ → Level ` +
                Humanize.formatNumber(
                  senitherreq.data.data.skills.fishing.level,
                  2
                ) +
                "\n" +
                `**Enchanting** _(${Humanize.formatNumber(
                  senitherreq.data.data.skills.enchanting.weight +
                    senitherreq.data.data.skills.enchanting.weight_overflow,
                  2
                )} weight)_ → Level ` +
                Humanize.formatNumber(
                  senitherreq.data.data.skills.enchanting.level,
                  2
                ) +
                "\n" +
                `**Alchemy** _(${Humanize.formatNumber(
                  senitherreq.data.data.skills.alchemy.weight +
                    senitherreq.data.data.skills.alchemy.weight_overflow,
                  2
                )} weight)_ → Level ` +
                Humanize.formatNumber(
                  senitherreq.data.data.skills.alchemy.level,
                  2
                ) +
                "\n" +
                `**Taming** _(${Humanize.formatNumber(
                  senitherreq.data.data.skills.taming.weight +
                    senitherreq.data.data.skills.taming.weight_overflow,
                  2
                )} weight)_ → Level ` +
                Humanize.formatNumber(
                  senitherreq.data.data.skills.taming.level,
                  2
                ) +
                "\n",
            },
            {
              name: `<:MADDOX:928817710178127902> Slayer Weight _(${Humanize.formatNumber(
                senitherreq.data.data.slayers.weight +
                  senitherreq.data.data.slayers.weight_overflow,
                2
              )} weight)_ : `,
              value:
                `**Revenant** _(${Humanize.formatNumber(
                  senitherreq.data.data.slayers.bosses.revenant.weight +
                    senitherreq.data.data.slayers.bosses.revenant
                      .weight_overflow,
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.slayers.bosses.revenant.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.slayers.bosses.revenant.level,
                  0
                )})_` +
                "\n" +
                `**Tarantula** _(${Humanize.formatNumber(
                  senitherreq.data.data.slayers.bosses.tarantula.weight +
                    senitherreq.data.data.slayers.bosses.tarantula
                      .weight_overflow,
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.slayers.bosses.tarantula.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.slayers.bosses.tarantula.level,
                  0
                )})_` +
                "\n" +
                `**Sven** _(${Humanize.formatNumber(
                  senitherreq.data.data.slayers.bosses.sven.weight +
                    senitherreq.data.data.slayers.bosses.sven.weight_overflow,
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.slayers.bosses.sven.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.slayers.bosses.sven.level,
                  0
                )})_` +
                "\n" +
                `**Enderman** _(${Humanize.formatNumber(
                  senitherreq.data.data.slayers.bosses.enderman.weight +
                    senitherreq.data.data.slayers.bosses.enderman
                      .weight_overflow,
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.slayers.bosses.enderman.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.slayers.bosses.enderman.level,
                  0
                )})_` +
                "\n",
            },
            {
              name: `
<:mort:923849004469616650> Dungeons Weight _(${Humanize.formatNumber(
                senitherreq.data.data.dungeons.weight +
                  senitherreq.data.data.dungeons.weight_overflow,
                2
              )} weight)_ : `,
              value:
                `**Catacombs** _(${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.types.catacombs.weight +
                    senitherreq.data.data.dungeons.types.catacombs
                      .weight_overflow,
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons.types.catacombs.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.types.catacombs.level,
                  2
                )})_` +
                "\n" +
                `**Healer** _(${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.classes.healer.weight +
                    senitherreq.data.data.dungeons.classes.healer
                      .weight_overflow,
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons.classes.healer.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.classes.healer.level,
                  2
                )})_` +
                "\n" +
                `**Mage** _(${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.classes.mage.weight +
                    senitherreq.data.data.dungeons.classes.mage.weight_overflow,
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons.classes.mage.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.classes.mage.level,
                  2
                )})_` +
                "\n" +
                `**Berserker** _(${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.classes.berserker.weight +
                    senitherreq.data.data.dungeons.classes.berserker
                      .weight_overflow,
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons.classes.berserker.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.classes.berserker.level,
                  2
                )})_` +
                "\n" +
                `**Archer** _(${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.classes.archer.weight +
                    senitherreq.data.data.dungeons.classes.archer
                      .weight_overflow,
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons.classes.archer.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.classes.archer.level,
                  2
                )})_` +
                "\n" +
                `**Tank** _(${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.classes.tank.weight +
                    senitherreq.data.data.dungeons.classes.tank.weight_overflow,
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons.classes.tank.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons.classes.tank.level,
                  2
                )})_`,
            }
          )
          .setDescription(
            `${uuiddata.name} has **${Humanize.formatNumber(
              senitherreq.data.data.weight +
                senitherreq.data.data.weight_overflow,
              2
            )}** weight.`
          );

        embed3
          .addFields(
            {
              name: "<:item_289:901956838864588810> Purse:",
              value: Humanize.compactInteger(res.purse, 2),
              inline: true,
            },
            {
              name: "<:item_266:901949082745069629> Bank",
              value: Humanize.compactInteger(res.bank, 2),
              inline: true,
            }
          )
          .setDescription(
            `${uuiddata.name}'s Total Networth is **$${Humanize.formatNumber(
              res.networth + res.bank + res.purse,
              2
            )}**`
          );

        if (res.sacks) {
          embed3.addField(
            "<:Sack_Of_Sacks:936101156290191421> Sacks",
            Humanize.compactInteger(res.sacks, 2),
            true
          );
        }

        const inventories = {
          armor: "<:tank:924858459428618342> Armour",
          wardrobe_inventory: "<:item_2875:902830721897472010> Wardrobe",
          inventory: "<:item_1515:902370580647534633> Inventory",
          enderchest: "<:item_447:902010140163711067> Ender Chest",
          storage: "<:item_1449:902348308687777822> Storage",
          pets: "<:item_3796:903200953082200065> Pets",
          talismans: "<:item_1877:902492754804899840> Accessories",
        };

        let armorText = "";
        let wardrobe_inventoryText = "";
        let inventoryText = "";
        let enderchestText = "";
        let storageText = "";
        let petsText = "";
        let talismansText = "";

        let repeatArmor;
        let repeatWardrobe_inventory;
        let repeatInventory;
        let repeatEnderchest;
        let repeatStorage;
        let repeatPets;
        let repeatTalismans;

        if (res.categories.armor.total > 0) {
          const categoryArmor = res.categories.armor;
          if (4 < categoryArmor.top_items.length + 1) {
            repeatArmor = 4;
          } else if (4 > categoryArmor.top_items.length + 1) {
            repeatArmor = categoryArmor.top_items.length;
          }
          for (let i = 0; i < repeatArmor; i++) {
            if (categoryArmor.top_items[i].count > 1) {
              armorText += `${categoryArmor.top_items[i]["count"]}x `;
            }
            if (categoryArmor.top_items[i].name) {
              armorText += categoryArmor.top_items[i].name;
            }
            if (categoryArmor.top_items[i].recomb) {
              armorText += " <:recomb:920527647400919060>";
            }
            if (categoryArmor.top_items[i].price) {
              armorText += ` _(${Humanize.compactInteger(
                categoryArmor.top_items[i].price,
                2
              )})_`;
            }
            armorText += "\n";
          }
        } else {
          armorText += "No Items tf";
        }

        if (res.categories.wardrobe_inventory.total > 0) {
          const categoryWardrobe_inventory = res.categories.wardrobe_inventory;
          if (4 < categoryWardrobe_inventory.top_items.length) {
            repeatWardrobe_inventory = 4;
          } else if (4 > categoryWardrobe_inventory.top_items.length) {
            repeatWardrobe_inventory =
              categoryWardrobe_inventory.top_items.length;
          }
          for (let i = 0; i < repeatWardrobe_inventory; i++) {
            if (categoryWardrobe_inventory.top_items[i].count > 1) {
              wardrobe_inventoryText += `${categoryWardrobe_inventory.top_items[i]["count"]}x `;
            }
            if (categoryWardrobe_inventory.top_items[i].name) {
              wardrobe_inventoryText +=
                categoryWardrobe_inventory.top_items[i].name;
            }
            if (categoryWardrobe_inventory.top_items[i].recomb) {
              wardrobe_inventoryText += " <:recomb:920527647400919060>";
            }
            if (categoryWardrobe_inventory.top_items[i].price) {
              wardrobe_inventoryText += ` _(${Humanize.compactInteger(
                categoryWardrobe_inventory.top_items[i].price,
                2
              )})_`;
            }
            wardrobe_inventoryText += "\n";
          }
        } else {
          wardrobe_inventoryText += "No Items tf";
        }

        if (res.categories.inventory.total > 0) {
          const categoryInventory = res.categories.inventory;
          if (4 < categoryInventory.top_items.length) {
            repeatInventory = 4;
          } else if (4 > categoryInventory.top_items.length) {
            repeatInventory = categoryInventory.top_items.length;
          }
          for (let i = 0; i < repeatInventory; i++) {
            if (categoryInventory.top_items[i].count > 1) {
              inventoryText += `${categoryInventory.top_items[i]["count"]}x `;
            }
            if (categoryInventory.top_items[i].name) {
              inventoryText += categoryInventory.top_items[i].name;
            }
            if (categoryInventory.top_items[i].recomb) {
              inventoryText += " <:recomb:920527647400919060>";
            }
            if (categoryInventory.top_items[i].price) {
              inventoryText += ` _(${Humanize.compactInteger(
                categoryInventory.top_items[i].price,
                2
              )})_`;
            }
            inventoryText += "\n";
          }
        } else {
          inventoryText += "No Items tf";
        }

        if (res.categories.enderchest.total > 0) {
          const categoryEnderChest = res.categories.enderchest;
          if (4 < categoryEnderChest.top_items.length) {
            repeatEnderchest = 4;
          } else if (4 > categoryEnderChest.top_items.length) {
            repeatEnderchest = categoryEnderChest.top_items.length;
          }
          for (let i = 0; i < repeatEnderchest; i++) {
            if (categoryEnderChest.top_items[i].count > 1) {
              enderchestText += `${categoryEnderChest.top_items[i]["count"]}x `;
            }
            if (categoryEnderChest.top_items[i].name) {
              enderchestText += categoryEnderChest.top_items[i].name;
            }
            if (categoryEnderChest.top_items[i].recomb) {
              enderchestText += " <:recomb:920527647400919060>";
            }
            if (categoryEnderChest.top_items[i].price) {
              enderchestText += ` _(${Humanize.compactInteger(
                categoryEnderChest.top_items[i].price,
                2
              )})_`;
            }
            enderchestText += "\n";
          }
        } else {
          enderchestText += "No Items tf";
        }

        if (res.categories.storage.total > 0) {
          const categoryStorage = res.categories.storage;
          if (4 < categoryStorage.top_items.length) {
            repeatStorage = 4;
          } else if (4 > categoryStorage.top_items.length) {
            repeatStorage = categoryStorage.top_items.length;
          }
          for (let i = 0; i < repeatStorage; i++) {
            if (categoryStorage.top_items[i].count > 1) {
              storageText += `${categoryStorage.top_items[i]["count"]}x `;
            }
            if (categoryStorage.top_items[i].name) {
              storageText += categoryStorage.top_items[i].name;
            }
            if (categoryStorage.top_items[i].recomb) {
              storageText += " <:recomb:920527647400919060>";
            }
            if (categoryStorage.top_items[i].price) {
              storageText += ` _(${Humanize.compactInteger(
                categoryStorage.top_items[i].price,
                2
              )})_`;
            }
            storageText += "\n";
          }
        } else {
          storageText += "No Items tf";
        }

        if (res.categories.pets.total > 0) {
          const categoryPets = res.categories.pets;
          if (4 < categoryPets.top_items.length) {
            repeatPets = 4;
          } else if (4 > categoryPets.top_items.length) {
            repeatPets = categoryPets.top_items.length;
          }
          for (let i = 0; i < repeatPets; i++) {
            if (categoryPets.top_items[i].count > 1) {
              petsText += `${categoryPets.top_items[i]["count"]}x `;
            }
            if (categoryPets.top_items[i].name) {
              petsText += categoryPets.top_items[i].name;
            }
            if (categoryPets.top_items[i].recomb) {
              petsText += " <:recomb:920527647400919060>";
            }
            if (categoryPets.top_items[i].price) {
              petsText += ` _(${Humanize.compactInteger(
                categoryPets.top_items[i].price,
                2
              )})_`;
            }
            petsText += "\n";
          }
        } else {
          petsText += "No Items tf";
        }

        if (res.categories.talismans.total > 0) {
          const categoryTalismans = res.categories.talismans;
          if (4 < categoryTalismans.top_items.length) {
            repeatTalismans = 4;
          } else if (4 > categoryTalismans.top_items.length) {
            repeatTalismans = categoryTalismans.top_items.length;
          }
          for (let i = 0; i < repeatTalismans; i++) {
            if (categoryTalismans.top_items[i].count > 1) {
              talismansText += `${categoryTalismans.top_items[i]["count"]}x `;
            }
            if (categoryTalismans.top_items[i].name) {
              talismansText += categoryTalismans.top_items[i].name;
            }
            if (categoryTalismans.top_items[i].recomb) {
              talismansText += " <:recomb:920527647400919060>";
            }
            if (categoryTalismans.top_items[i].price) {
              talismansText += ` _(${Humanize.compactInteger(
                categoryTalismans.top_items[i].price,
                2
              )})_`;
            }
            talismansText += "\n";
          }
        } else {
          talismansText += "No Items tf";
        }

        const texts = {
          armor: armorText,
          wardrobe_inventory: wardrobe_inventoryText,
          inventory: inventoryText,
          enderchest: enderchestText,
          storage: storageText,
          pets: petsText,
          talismans: talismansText,
        };
        let txt;
        for (let item in inventories) {
          if (res.categories[item]) {
            const req = res.categories[item];
            if (req) {
              txt = Humanize.compactInteger(req.total, 2);
            } else if (!req) {
              txt = "$0";
            }
            console.log(item);
            embed3.addField(
              inventories[item] + ` _($${txt})_`,
              `${texts[item]}`
            );
          }
        }
        return await pagination(msg, this.embeds, this.buttons, 30000);
      }
    } catch (e) {
      console.error(e);
      await message.util.reply(
        "<:error:923018104303415326>This command failed, probably because this player has their API off."
      );
    }
  }
}
