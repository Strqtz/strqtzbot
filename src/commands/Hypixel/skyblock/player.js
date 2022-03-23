import {
    AkairoMessage,
    Command
} from "discord-akairo";
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
import {
    pagination,
    paginationEmbed
} from "../../../libs/pagination.js";
import {
    getLevelFromXP,
    removeUnderscorePlus,
    getActiveProfile,
    ObjectLength,
    getProfile,
} from "../../../structures/Constants/constants.js";
//  import wait from "wait";
import LinkHypixel from "../../../structures/models/LinkHypixel.js";
//  import { json } from "express";
import {
    generateNetworthEmbed
} from "../../../structures/Constants/functions.js";

export default class PlayerCommand extends Command {
    constructor() {
        super("player", {
            aliases: ["player", "pv", "playerviewer"],
            description: {
                content: "Shows information about the player's skyblock profile",
                usage: "player <player>",
                examples: ["-player Strqtz"],
            },
            args: [{
                id: "ign",
                type: "string",
                description: "A players in-game name",
            }, ],
            channel: "all",
            slash: true,
            slashOptions: [{
                    name: "ign",
                    type: "STRING",
                    description: "A players in-game name",
                    required: false,
                },
                {
                    name: "profile",
                    type: "STRING",
                    description: "The player's profile. eg: Banana",
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
     * @param {{ign:string;profile:string}} args
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
                    content: "Link your Minecraft Account to the discord bot using `/verify [YOUR IGN]`",
                });
            }
            let uuidreq;
            if (!args.ign) {
                uuidreq = await cachios.get(
                    `https://sessionserver.mojang.com/session/minecraft/profile/${name.get(
            "uuid"
          )}`, {
                        ttl: 120
                    }
                );
            } else if (args.ign) {
                if (args.ign.length > 16) return message.util.reply("Invalid Name");
                uuidreq = await cachios.get(
                    `https://api.mojang.com/users/profiles/minecraft/${args.ign}`, {
                        ttl: 120
                    }
                );
            }
            const uuiddata = uuidreq.data;
            const msg = await message.util.reply({
                content: "Profile Viewer for " + uuiddata.name,
            });

            const profiles = await cachios.get(
                `https://api.hypixel.net/skyblock/profiles?key=${process.env.apiKey}&uuid=${uuiddata.id}`, {
                    ttl: 60
                }
            );
            const profilesdata = profiles.data;

            if (uuidreq && profiles.data.profiles !== null) {
                const friendsreq = await cachios.get(
                    `https://api.hypixel.net/friends?key=` +
                    process.env.apiKey +
                    "&uuid=" +
                    uuiddata.id, {
                        ttl: 60
                    }
                );

                const friendsdata = friendsreq.data;

                const playerreq = await cachios.get(
                    `https://api.hypixel.net/player?key=` +
                    process.env.apiKey +
                    "&uuid=" +
                    uuiddata.id, {
                        ttl: 60
                    }
                );

                let activeProfile;

                if (args.profile) {
                    activeProfile = getProfile(profiles.data.profiles, args.profile);
                } else {
                    activeProfile = getActiveProfile(profiles.data.profiles, uuiddata.id);
                }

                const profile = activeProfile.members[uuiddata.id];

                profile.banking = activeProfile.banking;

                const playerdata = playerreq.data;

                const time = splitTime(profile.last_save);

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

                const senitherreq = await cachios.get(
                    `https://hypixel-api.senither.com/v1/profiles/${uuiddata.id}/${activeProfile.cute_name}?key=${process.env.apiKey}`, {
                        ttl: 60
                    }
                );

                const sa = Humanize.formatNumber(
                    senitherreq.data.data.skills.average_skills,
                    2
                );

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
                } catch (e) {
                    console.error(e);
                }

                embed2
                    .setFields({
                        name: `<:berserk:924858459256660069> Skill Weight _(${Humanize.formatNumber(
                senitherreq.data.data.skills.weight +
                  senitherreq.data.data.skills.weight_overflow,
                2
              )} weight)_ :`,
                        value: `**Farming** _(${Humanize.formatNumber(
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
                    }, {
                        name: `<:MADDOX:928817710178127902> Slayer Weight _(${Humanize.formatNumber(
                senitherreq.data.data.slayers.weight +
                  senitherreq.data.data.slayers.weight_overflow,
                2
              )} weight)_ : `,
                        value: `**Revenant** _(${Humanize.formatNumber(
                  (senitherreq.data.data.slayers.bosses.revenant.weight ?? 0) +
                    (senitherreq.data.data.slayers.bosses.revenant
                      .weight_overflow ?? 0),
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
                  (senitherreq.data.data.slayers.bosses.tarantula.weight ?? 0) +
                    (senitherreq.data.data.slayers.bosses.tarantula
                      .weight_overflow ?? 0),
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
                  (senitherreq.data.data.slayers.bosses.sven.weight ?? 0) +
                    (senitherreq.data.data.slayers.bosses.sven
                      .weight_overflow ?? 0),
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
                  (senitherreq.data.data.slayers.bosses.enderman.weight ?? 0) +
                    (senitherreq.data.data.slayers.bosses.enderman
                      .weight_overflow ?? 0),
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.slayers.bosses.enderman.experience,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.slayers.bosses.enderman.level,
                  0
                )})_` +
                            "\n",
                    }, {
                        name: `
<:mort:923849004469616650> Dungeons Weight _(${Humanize.formatNumber(
                (senitherreq.data.data.dungeons?.weight ?? 0) +
                  (senitherreq.data.data.dungeons?.weight.weight_overflow ?? 0),
                2
              )} weight)_ : `,
                        value: `**Catacombs** _(${Humanize.formatNumber(
                  (senitherreq.data.data.dungeons?.types.catacombs.weight ??
                    0) +
                    (senitherreq.data.data.dungeons?.types.catacombs
                      .weight_overflow ?? 0),
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons?.types.catacombs.experience ??
                    0,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons?.types.catacombs.level ?? 0,
                  2
                )})_` +
                            "\n" +
                            `**Healer** _(${Humanize.formatNumber(
                  (senitherreq.data.data.dungeons?.classes.healer.weight ?? 0) +
                    (senitherreq.data.data.dungeons?.classes.healer
                      .weight_overflow ?? 0),
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons?.classes.healer.experience ??
                    0,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons?.classes.healer.level ?? 0,
                  2
                )})_` +
                            "\n" +
                            `**Mage** _(${Humanize.formatNumber(
                  (senitherreq.data.data.dungeons?.classes.mage.weight ?? 0) +
                    (senitherreq.data.data.dungeons?.classes.mage
                      .weight_overflow ?? 0),
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons?.classes.mage.experience ?? 0,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons?.classes.mage.level ?? 0,
                  2
                )})_` +
                            "\n" +
                            `**Berserker** _(${Humanize.formatNumber(
                  (senitherreq.data.data.dungeons?.classes.berserker.weight ??
                    0) +
                    (senitherreq.data.data.dungeons?.classes.berserker
                      .weight_overflow ?? 0),
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons?.classes.berserker
                    .experience ?? 0,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons?.classes.berserker.level ?? 0,
                  2
                )})_` +
                            "\n" +
                            `**Archer** _(${Humanize.formatNumber(
                  (senitherreq.data.data.dungeons?.classes.archer.weight ?? 0) +
                    (senitherreq.data.data.dungeons?.classes.archer
                      .weight_overflow ?? 0),
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons?.classes.archer.experience ??
                    0,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons?.classes.archer.level ?? 0,
                  2
                )})_` +
                            "\n" +
                            `**Tank** _(${Humanize.formatNumber(
                  (senitherreq.data.data.dungeons?.classes.tank.weight ?? 0) +
                    (senitherreq.data.data.dungeons?.classes.tank
                      .weight_overflow ?? 0),
                  2
                )} weight)_ → Experience ${Humanize.compactInteger(
                  senitherreq.data.data.dungeons?.classes.tank.experience ?? 0,
                  1
                )} _(Level ${Humanize.formatNumber(
                  senitherreq.data.data.dungeons?.classes.tank.level ?? 0,
                  2
                )})_`,
                    })
                    .setDescription(
                        `${uuiddata.name} has **${Humanize.formatNumber(
              senitherreq.data.data.weight +
                senitherreq.data.data.weight_overflow,
              2
            )}** weight.`
                    );
                if (args.profile) {
                    await generateNetworthEmbed(
                        uuiddata.id,
                        embed3,
                        uuiddata.name,
                        embed,
                        args.profile
                    );
                } else {
                    await generateNetworthEmbed(
                        uuiddata.id,
                        embed3,
                        uuiddata.name,
                        embed
                    );
                }

                return await pagination(msg, this.embeds, this.buttons, 30000);
            }
        } catch (e) {
            console.error(e);
            await message.util.reply(`\``
                `${e}\``
                ``);
        }
    }
}
