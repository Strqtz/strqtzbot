// import { AkairoMessage, Command } from "discord-akairo";
// import { Message, MessageButton, MessageEmbed } from "discord.js";
// import LinkHypixel from "../../../structures/models/LinkHypixel.js";
// import cachios from "cachios";
// import {
//   removeUnderscorePlus,
//   getActiveProfile,
//   getActiveProfileCuteName,
//   ObjectLength,
//   getTotalScore,
// } from "../../../structures/Constants/constants.js";
// import Humanize from "humanize-plus";
// import humanize from "humanize-duration";
// import { pagination, paginationEmbed } from "discordjs-button-pagination";
//
// export default class DungeonsCommand extends Command {
//   constructor() {
//     super("dungeons", {
//       aliases: ["dungeons", "cata", "catacombs", "d", "c"],
//       description: {
//         content: "Get a Players Catacombs information",
//         usage: "dungeons <ign>",
//         examples: ["-dungeons Strqtz"],
//       },
//       args: [
//         {
//           id: "ign",
//           type: "string",
//           description: "A players in-game name",
//         },
//       ],
//       channel: "all",
//       slash: true,
//       slashOptions: [
//         {
//           name: "ign",
//           type: "STRING",
//           description: "A players in-game name",
//           required: false,
//         },
//       ],
//       cooldown: 60000,
//       ratelimit: 2,
//     });
//   }
//
//   buttons;
//   embeds;
//
//   /**
//    * @param {Message | AkairoMessage }message
//    * @param {{ign:string}} args
//    */
//
//   async exec(message, args) {
//     const floorName =
//       '{"floor_1": "Floor 1", "floor_2": "Floor 2", "floor_3": "Floor 3", "floor_4": "Floor 4", "floor_5": "Floor 5", "floor_6": "Floor 6", "floor_7": "Floor 7"}';
//     const obj = JSON.parse(floorName);
//     let name;
//     name = await LinkHypixel.findOne({
//       discordID: message.author.id,
//     });
//     if (!name) {
//       await message.util.reply({
//         content:
//           "Link your Minecraft Account to the discord bot using `/verify [YOUR IGN]`",
//       });
//     }
//     let uuidreq;
//     if (!args.ign) {
//       uuidreq = await cachios.get(
//         `https://sessionserver.mojang.com/session/minecraft/profile/${name.get(
//           "uuid"
//         )}`,
//         { ttl: 120 }
//       );
//     } else if (args.ign) {
//       if (args.ign.length > 16) return message.util.reply("Invalid Name");
//       uuidreq = await cachios.get(
//         `https://api.mojang.com/users/profiles/minecraft/${args.ign}`,
//         { ttl: 120 }
//       );
//     }
//     const uuiddata = uuidreq.data;
//     const msg = await message.util.reply({
//       content: "Dungeons Information for " + uuiddata.name,
//     });
//     const profiles = await cachios.get(
//       `https://api.hypixel.net/skyblock/profiles?key=${process.env.apiKey}&uuid=${uuiddata.id}`,
//       { ttl: 60 }
//     );
//
//     const actProfile = getActiveProfileCuteName(
//       profiles.data.profiles,
//       uuiddata.id
//     );
//
//     const skyshiiyureq = await cachios.get(
//       `https://sky.shiiyu.moe/api/v2/dungeons/${uuiddata.id}/${actProfile}`,
//       { ttl: 120 }
//     );
//
//     const playerreq = await cachios.get(
//       `https://api.hypixel.net/player?key=` +
//         process.env.apiKey +
//         "&uuid=" +
//         uuiddata.id,
//       { ttl: 60 }
//     );
//
//     const playerdata = playerreq.data;
//
//     const activeProfile = getActiveProfile(profiles.data.profiles, uuiddata.id);
//     //prettier-ignore
//     const dungeonsComps =
//           (activeProfile.members[uuiddata.id].dungeons.dungeon_types.catacombs
//           .tier_completions);
//
//     function totRuns(uuid) {
//       let runs = 0;
//       for (let i = 0; i < ObjectLength(dungeonsComps); i++) {
//         runs =
//           runs +
//           activeProfile.members[uuid].dungeons.dungeon_types.catacombs
//             .tier_completions[i];
//       }
//       return runs;
//     }
//
//     const catacombsFloors = skyshiiyureq.data.dungeons.catacombs.floors;
//
//     function highestFloor(uuid) {
//       let runs;
//       runs = catacombsFloors[ObjectLength(catacombsFloors) - 1];
//       return runs;
//     }
//
//     const score0 = getTotalScore(
//       skyshiiyureq.data.dungeons.catacombs.floors[0].best_runs[0]
//         .score_exploration,
//       skyshiiyureq.data.dungeons.catacombs.floors[0].best_runs[0].score_speed,
//       skyshiiyureq.data.dungeons.catacombs.floors[0].best_runs[0].score_skill,
//       skyshiiyureq.data.dungeons.catacombs.floors[0].best_runs[0].score_bonus
//     );
//
//     const score1 = getTotalScore(
//       skyshiiyureq.data.dungeons.catacombs.floors[1].best_runs[0]
//         .score_exploration,
//       skyshiiyureq.data.dungeons.catacombs.floors[1].best_runs[0].score_speed,
//       skyshiiyureq.data.dungeons.catacombs.floors[1].best_runs[0].score_skill,
//       skyshiiyureq.data.dungeons.catacombs.floors[1].best_runs[0].score_bonus
//     );
//
//     const score2 = getTotalScore(
//       skyshiiyureq.data.dungeons.catacombs.floors[2].best_runs[0]
//         .score_exploration,
//       skyshiiyureq.data.dungeons.catacombs.floors[2].best_runs[0].score_speed,
//       skyshiiyureq.data.dungeons.catacombs.floors[2].best_runs[0].score_skill,
//       skyshiiyureq.data.dungeons.catacombs.floors[2].best_runs[0].score_bonus
//     );
//
//     const score3 = getTotalScore(
//       skyshiiyureq.data.dungeons.catacombs.floors[3].best_runs[0]
//         .score_exploration,
//       skyshiiyureq.data.dungeons.catacombs.floors[3].best_runs[0].score_speed,
//       skyshiiyureq.data.dungeons.catacombs.floors[3].best_runs[0].score_skill,
//       skyshiiyureq.data.dungeons.catacombs.floors[3].best_runs[0].score_bonus
//     );
//
//     const score4 = getTotalScore(
//       skyshiiyureq.data.dungeons.catacombs.floors[4].best_runs[0]
//         .score_exploration,
//       skyshiiyureq.data.dungeons.catacombs.floors[4].best_runs[0].score_speed,
//       skyshiiyureq.data.dungeons.catacombs.floors[4].best_runs[0].score_skill,
//       skyshiiyureq.data.dungeons.catacombs.floors[4].best_runs[0].score_bonus
//     );
//
//     const score5 = getTotalScore(
//       skyshiiyureq.data.dungeons.catacombs.floors[5].best_runs[0]
//         .score_exploration,
//       skyshiiyureq.data.dungeons.catacombs.floors[5].best_runs[0].score_speed,
//       skyshiiyureq.data.dungeons.catacombs.floors[5].best_runs[0].score_skill,
//       skyshiiyureq.data.dungeons.catacombs.floors[5].best_runs[0].score_bonus
//     );
//
//     const score6 = getTotalScore(
//       skyshiiyureq.data.dungeons.catacombs.floors[6].best_runs[0]
//         .score_exploration,
//       skyshiiyureq.data.dungeons.catacombs.floors[6].best_runs[0].score_speed,
//       skyshiiyureq.data.dungeons.catacombs.floors[6].best_runs[0].score_skill,
//       skyshiiyureq.data.dungeons.catacombs.floors[6].best_runs[0].score_bonus
//     );
//
//     const score7 = getTotalScore(
//       skyshiiyureq.data.dungeons.catacombs.floors[7].best_runs[0]
//         .score_exploration,
//       skyshiiyureq.data.dungeons.catacombs.floors[7].best_runs[0].score_speed,
//       skyshiiyureq.data.dungeons.catacombs.floors[7].best_runs[0].score_skill,
//       skyshiiyureq.data.dungeons.catacombs.floors[7].best_runs[0].score_bonus
//     );
//
//     const embed = new MessageEmbed().setThumbnail(
//       `https://crafatar.com/avatars/${uuiddata.id}?size=32&overlay&default=717eb72c52024fbaa91a3e61f34b3b58`
//     );
//     const embed2 = new MessageEmbed().setThumbnail(
//       `https://crafatar.com/avatars/${uuiddata.id}?size=32&overlay&default=717eb72c52024fbaa91a3e61f34b3b58`
//     );
//
//     const button1 = new MessageButton()
//       .setLabel("<=")
//       .setCustomId("backbtn")
//       .setStyle("DANGER");
//     const button2 = new MessageButton()
//       .setLabel("=>")
//       .setCustomId("nxtbutton")
//       .setStyle("SUCCESS");
//
//     this.embeds = [embed, embed2];
//
//     this.buttons = [button1, button2];
//
//     for (let i = 0; i < ObjectLength(this.embeds); i++) {
//       if (playerdata.player.rank) {
//         this.embeds[i].setTitle(`[${playerdata.player.rank}] ${uuiddata.name}`);
//       } else if (!playerdata.player.monthlyPackageRank === "NONE") {
//         this.embeds[i].setTitle(`[MVP++] ${uuiddata.name}`);
//       } else if (playerdata.player.newPackageRank) {
//         this.embeds[i].setTitle(
//           "[" +
//             removeUnderscorePlus(playerdata.player.newPackageRank) +
//             `] ${uuiddata.name}`
//         );
//       } else {
//         this.embeds[i].setTitle(`${uuiddata.name}`);
//       }
//     }
//     embed
//       .setDescription(
//         "**Total Secrets:** " +
//           skyshiiyureq.data.dungeons.secrets_found +
//           "\n" +
//           "**Secrets Per Run:** " +
//           Humanize.formatNumber(
//             playerdata.player.achievements.skyblock_treasure_hunter /
//               totRuns(uuiddata.id),
//             2
//           ) +
//           `_**(${totRuns(uuiddata.id)} runs)**_`
//       )
//       .setFields(
//         {
//           name: `<:mort:923849004469616650> Catacombs ***(${Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.catacombs.level.levelWithProgress,
//             2
//           )})***: `,
//           value:
//             `**Total:** ${Humanize.formatNumber(
//               skyshiiyureq.data.dungeons.catacombs.level.xp,
//               2
//             )} exp` +
//             "\n" +
//             `**Progress:** ${skyshiiyureq.data.dungeons.catacombs.level.xpCurrent} / ${skyshiiyureq.data.dungeons.catacombs.level.xpForNext} exp`,
//           inline: true,
//         },
//         {
//           name: `<:healer:924858459592196156> Healer ***(${Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.classes.healer.experience
//               .levelWithProgress,
//             2
//           )})***:`,
//           value:
//             `**Total:** ${Humanize.formatNumber(
//               skyshiiyureq.data.dungeons.classes.healer.experience.xp,
//               2
//             )} exp` +
//             "\n" +
//             `**Progress:** ${skyshiiyureq.data.dungeons.classes.healer.experience.xpCurrent} / ${skyshiiyureq.data.dungeons.classes.healer.experience.xpForNext} exp`,
//           inline: true,
//         },
//         {
//           name: `<:mage:924858459764183090> Mage ***(${Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.classes.mage.experience
//               .levelWithProgress,
//             2
//           )})***:`,
//           value:
//             `**Total:** ${Humanize.formatNumber(
//               skyshiiyureq.data.dungeons.classes.mage.experience.xp,
//               2
//             )} exp` +
//             "\n" +
//             `**Progress:** ${skyshiiyureq.data.dungeons.classes.mage.experience.xpCurrent} / ${skyshiiyureq.data.dungeons.classes.mage.experience.xpForNext} exp`,
//           inline: true,
//         },
//         {
//           name: `<:berserk:924858459256660069> Berserk ***(${Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.classes.berserk.experience
//               .levelWithProgress,
//             2
//           )})***:`,
//           value:
//             `**Total:** ${Humanize.formatNumber(
//               skyshiiyureq.data.dungeons.classes.berserk.experience.xp,
//               2
//             )} exp` +
//             "\n" +
//             `**Progress:** ${skyshiiyureq.data.dungeons.classes.berserk.experience.xpCurrent} / ${skyshiiyureq.data.dungeons.classes.berserk.experience.xpForNext} exp`,
//           inline: true,
//         },
//         {
//           name: `<:archer:924858459671900210> Archer ***(${Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.classes.archer.experience
//               .levelWithProgress,
//             2
//           )})***:`,
//           value:
//             `**Total:** ${Humanize.formatNumber(
//               skyshiiyureq.data.dungeons.classes.archer.experience.xp,
//               2
//             )} exp` +
//             "\n" +
//             `**Progress:** ${skyshiiyureq.data.dungeons.classes.archer.experience.xpCurrent} / ${skyshiiyureq.data.dungeons.classes.archer.experience.xpForNext} exp`,
//           inline: true,
//         },
//         {
//           name: `<:tank:924858459428618342> Tank ***(${Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.classes.tank.experience
//               .levelWithProgress,
//             2
//           )})***:`,
//           value:
//             `**Total:** ${Humanize.formatNumber(
//               skyshiiyureq.data.dungeons.classes.tank.experience.xp,
//               2
//             )} exp` +
//             "\n" +
//             `**Progress:** ${skyshiiyureq.data.dungeons.classes.tank.experience.xpCurrent} / ${skyshiiyureq.data.dungeons.classes.tank.experience.xpForNext} exp`,
//           inline: true,
//         }
//       );
//     embed2.setDescription("Catacombs Information").setFields(
//       {
//         name: "Entrance PB:",
//         value:
//           "**Score:** " +
//           score0[0] +
//           " _**(" +
//           score0[1] +
//           ")**_" +
//           "\n" +
//           "**Time:** " +
//           humanize(
//             skyshiiyureq.data.dungeons.catacombs.floors[0].best_runs[0]
//               .elapsed_time,
//             { round: true }
//           ) +
//           "\n" +
//           "**Selected Class:** " +
//           Humanize.capitalize(
//             skyshiiyureq.data.dungeons.catacombs.floors[0].best_runs[0]
//               .dungeon_class
//           ) +
//           "\n" +
//           "**Damage Dealt:** " +
//           Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.catacombs.floors[1].best_runs[0]
//               .damage_dealt
//           ),
//       },
//       {
//         name: "Floor 1 PB:",
//         value:
//           "**Score:** " +
//           score1[0] +
//           " _**(" +
//           score1[1] +
//           ")**_" +
//           "\n" +
//           "**Time:** " +
//           humanize(
//             skyshiiyureq.data.dungeons.catacombs.floors[1].best_runs[0]
//               .elapsed_time,
//             { round: true }
//           ) +
//           "\n" +
//           "**Selected Class:** " +
//           Humanize.capitalize(
//             skyshiiyureq.data.dungeons.catacombs.floors[1].best_runs[0]
//               .dungeon_class
//           ) +
//           "\n" +
//           "**Damage Dealt:** " +
//           Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.catacombs.floors[1].best_runs[0]
//               .damage_dealt
//           ),
//       },
//       {
//         name: "Floor 2 PB:",
//         value:
//           "**Score:** " +
//           score2[0] +
//           " _**(" +
//           score2[1] +
//           ")**_" +
//           "\n" +
//           "**Time:** " +
//           humanize(
//             skyshiiyureq.data.dungeons.catacombs.floors[2].best_runs[0]
//               .elapsed_time,
//             { round: true }
//           ) +
//           "\n" +
//           "**Selected Class:** " +
//           Humanize.capitalize(
//             skyshiiyureq.data.dungeons.catacombs.floors[2].best_runs[0]
//               .dungeon_class
//           ) +
//           "\n" +
//           "**Damage Dealt:** " +
//           Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.catacombs.floors[2].best_runs[0]
//               .damage_dealt
//           ),
//       },
//       {
//         name: "Floor 3 PB:",
//         value:
//           "**Score:** " +
//           score3[0] +
//           " _**(" +
//           score3[1] +
//           ")**_" +
//           "\n" +
//           "**Time:** " +
//           humanize(
//             skyshiiyureq.data.dungeons.catacombs.floors[3].best_runs[0]
//               .elapsed_time,
//             { round: true }
//           ) +
//           "\n" +
//           "**Selected Class:** " +
//           Humanize.capitalize(
//             skyshiiyureq.data.dungeons.catacombs.floors[3].best_runs[0]
//               .dungeon_class
//           ) +
//           "\n" +
//           "**Damage Dealt:** " +
//           Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.catacombs.floors[3].best_runs[0]
//               .damage_dealt
//           ),
//       },
//       {
//         name: "Floor 4 PB:",
//         value:
//           "**Score:** " +
//           score4[0] +
//           " _**(" +
//           score4[1] +
//           ")**_" +
//           "\n" +
//           "**Time:** " +
//           humanize(
//             skyshiiyureq.data.dungeons.catacombs.floors[4].best_runs[0]
//               .elapsed_time,
//             { round: true }
//           ) +
//           "\n" +
//           "**Selected Class:** " +
//           Humanize.capitalize(
//             skyshiiyureq.data.dungeons.catacombs.floors[4].best_runs[0]
//               .dungeon_class
//           ) +
//           "\n" +
//           "**Damage Dealt:** " +
//           Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.catacombs.floors[4].best_runs[0]
//               .damage_dealt
//           ),
//       },
//       {
//         name: "Floor 5 PB:",
//         value:
//           "**Score:** " +
//           score5[0] +
//           " _**(" +
//           score5[1] +
//           ")**_" +
//           "\n" +
//           "**Time:** " +
//           humanize(
//             skyshiiyureq.data.dungeons.catacombs.floors[5].best_runs[0]
//               .elapsed_time,
//             { round: true }
//           ) +
//           "\n" +
//           "**Selected Class:** " +
//           Humanize.capitalize(
//             skyshiiyureq.data.dungeons.catacombs.floors[5].best_runs[0]
//               .dungeon_class
//           ) +
//           "\n" +
//           "**Damage Dealt:** " +
//           Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.catacombs.floors[5].best_runs[0]
//               .damage_dealt
//           ),
//       },
//       {
//         name: "Floor 6 PB:",
//         value:
//           "**Score:** " +
//           score6[0] +
//           " _**(" +
//           score6[1] +
//           ")**_" +
//           "\n" +
//           "**Time:** " +
//           humanize(
//             skyshiiyureq.data.dungeons.catacombs.floors[6].best_runs[0]
//               .elapsed_time,
//             { round: true }
//           ) +
//           "\n" +
//           "**Selected Class:** " +
//           Humanize.capitalize(
//             skyshiiyureq.data.dungeons.catacombs.floors[6].best_runs[0]
//               .dungeon_class
//           ) +
//           "\n" +
//           "**Damage Dealt:** " +
//           Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.catacombs.floors[6].best_runs[0]
//               .damage_dealt
//           ),
//       },
//       {
//         name: "Floor 7 PB:",
//         value:
//           "**Score:** " +
//           score7[0] +
//           " _**(" +
//           score7[1] +
//           ")**_" +
//           "\n" +
//           "**Time:** " +
//           humanize(
//             skyshiiyureq.data.dungeons.catacombs.floors[7].best_runs[0]
//               .elapsed_time,
//             { round: true }
//           ) +
//           "\n" +
//           "**Selected Class:** " +
//           Humanize.capitalize(
//             skyshiiyureq.data.dungeons.catacombs.floors[7].best_runs[0]
//               .dungeon_class
//           ) +
//           "\n" +
//           "**Damage Dealt:** " +
//           Humanize.formatNumber(
//             skyshiiyureq.data.dungeons.catacombs.floors[7].best_runs[0]
//               .damage_dealt
//           ),
//       }
//     );
//
//     if (message.interaction) {
//       await paginationEmbed(msg.interaction, this.embeds, this.buttons, 30000);
//     }
//     await pagination(msg, this.embeds, this.buttons, 30000);
//   }
// }
