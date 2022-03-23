import Client from "./structures/client/Client.js";
const {
    channel
} = Client;
import mineflayer from "mineflayer";
import * as colors from "colors";
import {
    MessageEmbed
} from "discord.js";
import cachios from "cachios";
import wait from "wait";
import schedule from "node-schedule";
import LinkHypixel from "./structures/models/LinkHypixel.js";

const client = new Client();
const options = {
    username: process.env.MC_EMAIL,
    password: process.env.MC_PASSWORD,
    version: "1.8.9",
    host: "mc.hypixel.net",
    auth: "mojang",
};

export let mc;

function init() {
    console.log("Signing in!");
    mc = mineflayer.createBot(options);
    mc._client.once("session", (session) => (options.session = session));
}

function reInit() {
    mc.exit();
    init();
}

function limbo() {
    mc.chat("/achat §c");
}

try {
    client.run(client);
    init();
} catch (e) {
    console.log(e);
}

mc.addChatPatternSet(
    "PARTY_INVITE",
    [
        /^-----------------------------\n(?:\[(.+\+?\+?)\] )?(.+) has invited you to join their party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------/,
    ], {
        parse: true,
    }
);

mc.addChatPatternSet(
    "PARTY_WARP",
    [/^(.+) warped the party to a SkyBlock dungeon!/], {
        parse: true,
    }
);

mc.addChatPatternSet(
    "GET_G_ONLINE",
    [/^(.+) warped the party to a SkyBlock dungeon!/], {
        parse: true,
    }
);

mc.on("kicked", async (reason) => {
    const gchannel = client.channels.cache.get("904675293640392724");
    const kickembed = new MessageEmbed();
    kickembed
        .setColor("#ff0000")
        .setDescription("The bot was kicked for _" + reason + "_");
    await gchannel.send({
        embeds: [kickembed]
    });
    await reInit();
});

mc.on("end", () => {
    reInit();
});

mc.on("message", async (chatmsg) => {
    let msg = chatmsg.toString();
    console.log("Minecraft: ".green + msg);
    const gchannel = client.channels.cache.get("904675293640392724");
    if (msg.endsWith(" joined the lobby!") && msg.includes("[MVP+")) {
        limbo();
        console.log("Sending to limbo.");
    }
    if (!msg.includes("ArmorOfDivan")) {
        if (msg.startsWith("Guild > ")) {
            const embed = new MessageEmbed();
            let user = msg
                .replaceAll(/\[(.*?)\]/g, "")
                .trim()
                .split(/ +/g)[0];
            if (isJoinMessage(msg)) {
                embed
                    .setDescription(user + " joined the guild!")
                    .setTitle("Someone Joined :o")
                    .setThumbnail(`https://mc-heads.net/avatar/${user}`)
                    .setColor("#00ff00");

                gchannel.sendNew({
                    embeds: [embed]
                });
                let uuidreq = await cachios.get(
                    `https://api.mojang.com/users/profiles/minecraft/${user}`, {
                        ttl: 120
                    }
                );
                let discord = LinkHypixel.find({
                    uuid: uuidreq.data.id
                });
                if (!discord) {
                    return mc.chat(
                        `/gc ${user} Please do /g discord to join our discord. Then verify and run /verify <YOUR MCNAME> in bot-commands`
                    );
                }
                if (discord) {
                    await client.guilds.cache
                        .get("900692529048080424")
                        .members.cache.get(discord.get("discordID"))
                        .roles.remove(
                            client.guilds.cache
                            .get("900692529048080424")
                            .roles.cache.get("900693304168030228").id
                        );
                }
            }

            if (isLeaveMessage(msg)) {
                embed
                    .setDescription(user + " left the guild!")
                    .setTitle("Someone left :c")
                    .setThumbnail(`https://mc-heads.net/avatar/${user}`)
                    .setColor("#ff0000");

                await gchannel.send({
                    embeds: [embed]
                });
                let uuidreq = await cachios.get(
                    `https://api.mojang.com/users/profiles/minecraft/${user}`, {
                        ttl: 120
                    }
                );
                let discord = LinkHypixel.find({
                    uuid: uuidreq.data.id
                });
                if (!discord) {
                    return;
                }
                if (discord) {
                    await client.guilds.cache
                        .get("900692529048080424")
                        .members.cache.get(discord.get("discordID"))
                        .roles.remove(
                            client.guilds.cache
                            .get("900692529048080424")
                            .roles.cache.get("900693304168030228").id
                        );
                }
            }

            if (isKickMessage(msg)) {
                embed
                    .setDescription(user + " was kicked from the guild!")
                    .setTitle("Someone was kicked :skull:")
                    .setThumbnail(`https://mc-heads.net/avatar/${user}`)
                    .setColor("#ff0000");
                gchannel.send({
                    embeds: [embed]
                });
                let uuidreq = await cachios.get(
                    `https://api.mojang.com/users/profiles/minecraft/${user}`, {
                        ttl: 120
                    }
                );
                let discord = LinkHypixel.find({
                    uuid: uuidreq.data.id
                });
                if (!discord) {
                    return;
                }
                if (discord) {
                    await client.guilds.cache
                        .get("900692529048080424")
                        .members.cache.get(discord.get("discordID"))
                        .roles.remove(
                            client.guilds.cache
                            .get("900692529048080424")
                            .roles.cache.get("900693304168030228").id
                        );
                }
            }
            const guildless = msg.replace("Guild > ", "");
            msg = guildless.substr(0, guildless.length);
            let ranklessMsg = msg.replaceAll(/\[(.*?)\]/g, "").split(": ")[0];
            if (ranklessMsg.includes(" left.")) {
                ranklessMsg = ranklessMsg.replace(" left.", "");
            } else if (ranklessMsg.includes(" joined.")) {
                ranklessMsg = ranklessMsg.replace(" joined.", "");
            }
            ranklessMsg = ranklessMsg.replaceAll(" ", "");
            console.log(ranklessMsg);
            embed
                .setThumbnail(`https://mc-heads.net/avatar/${ranklessMsg}/128.png`)
                .setTitle(ranklessMsg);
            if (
                msg.startsWith("[OWNER]") ||
                msg.startsWith("ADMIN") ||
                msg.startsWith("[YOUTUBER]")
            ) {
                embed.setColor("#FF5555").setDescription(msg);
                await gchannel.send({
                    embeds: [embed]
                });
            } else if (msg.startsWith("[MVP++]")) {
                embed.setColor("#FFAA00").setDescription(msg);
                await gchannel.send({
                    embeds: [embed]
                });
            } else if (msg.startsWith("[MVP+]") || msg.startsWith("[MVP]")) {
                embed.setColor("#3CE6E6").setDescription(msg);
                await gchannel.send({
                    embeds: [embed]
                });
            } else if (msg.startsWith("[VIP+]") || msg.startsWith("[VIP]")) {
                embed.setColor("#3CE63C").setDescription(msg);
                await gchannel.send({
                    embeds: [embed]
                });
            } else if (msg.includes("joined.") && !msg.includes(":")) {
                embed.setColor("#00ff00").setDescription(msg);
                await gchannel.send({
                    embeds: [embed]
                });
            } else if (msg.includes("left.") && !msg.includes(":")) {
                embed.setColor("#ff0000").setDescription(msg);
                await gchannel.send({
                    embeds: [embed]
                });
            } else {
                embed.setColor("#AAAAAA").setDescription(msg);
                await gchannel.send({
                    embeds: [embed]
                });
            }
        }
    }
});

function leaveparty() {
    mc.chat(`/p leave`);
}

function isJoinMessage(message) {
    if (message.includes("joined the guild!") && !message.includes(":")) {
        return true;
    }
}

function isLeaveMessage(message) {
    if (message.includes("left the guild!") && !message.includes(":")) {
        return true;
    }
}

function isKickMessage(message) {
    if (
        message.includes("was kicked from the guild by") &&
        !message.includes(":")
    ) {
        return true;
    }
}

mc.on("chat:PARTY_WARP", ([
    [username]
]) => {
    if (mc.username === username) {
        return;
    }
    leaveparty();
});

mc.on("chat:PARTY_INVITE", async ([
    [rank, username]
]) => {
    limbo();
    if (mc.username === username) {
        return;
    }

    const uuidb4data = await cachios.get(
        `https://api.mojang.com/users/profiles/minecraft/${username}`, {
            ttl: 60,
        }
    );
    const uuid = uuidb4data.data;

    const guildreq = await cachios.get(
        `https://api.hypixel.net/guild?player=${uuid.id}&key=${process.env.apiKey}`
    );

    const data = guildreq.data;

    if (data.guild != null) {
        if (data.guild.name === "StopThrowing") {
            const gchannel = client.channels.cache.get("904675293640392724");
            let embed = new MessageEmbed()
                .setTitle("Joined " + uuid.name + "'s party!")
                .setImage(`https://mc-heads.net/avatar/${uuid.name}/128.png`)
                .setColor("#00ff00");
            mc.chat(`/p accept ${username}`);
            await gchannel.send({
                embeds: [embed]
            });
            limbo();
            wait(5000).then(async () => {
                leaveparty();
                embed = new MessageEmbed()
                    .setTitle("Left " + uuid.name + "'s party.")
                    .setImage(`https://mc-heads.net/avatar/${uuid.name}/128.png`)
                    .setColor("#ff0000");
                await gchannel.send({
                    embeds: [embed]
                });
            });
        }
    }
});
