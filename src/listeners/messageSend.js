import {
    AkairoMessage,
    Command,
    Listener
} from "discord-akairo";
import {
    Channel,
    Message,
    MessageEmbed,
    WebhookClient
} from "discord.js";
import {
    google
} from "googleapis";
import MessageExp from "../structures/models/MessageExp.js";
import Prefix from "../structures/models/Prefix.js";
import {
    mc
} from "../index.js";
import wait from "wait";
import GuildSetting from "../structures/models/GuildSettings.js";

export default class messageSendListener extends Listener {
    constructor() {
        super("messageSendListener", {
            emitter: "client",
            event: "messageCreate",
        });
    }

    /**
     * @param {Message | AkairoMessage} message
     * @param {Command} command
     */

    async exec(message, command) {
        let userExist;
        userExist = await MessageExp.findOne({
            discordID: message.author.id,
        });
        if (!message.author.bot && !command) {
            if (!userExist) {
                let expCreate = await MessageExp.create({
                    discordID: message.author.id,
                    exp: 0,
                    level: 0,
                });
                await expCreate.save();
            } else {
                let experience = Math.floor(Math.random() * 101);
                await MessageExp.findOneAndUpdate({
                    discordID: message.author.id
                }, {
                    $inc: {
                        exp: experience,
                    },
                });
                const expRequired =
                    5 * Math.pow(userExist.level, 2) + 50 * userExist.level + 100;
                if (userExist.exp >= expRequired) {
                    await MessageExp.findOneAndUpdate({
                        discordID: message.author.id
                    }, {
                        $inc: {
                            level: 1,
                            exp: -expRequired,
                        },
                    });
                    await wait(1000);
                    message.author
                        .send(
                            `<@${userExist.discordID}> you levelled up to ${
                userExist.level + 1
              }`
                        )
                        .then(async () => {
                            console.log("");
                            await wait(5000);
                        });
                }
            }

            if (message.content.startsWith("ez") || message.content.includes(" ez")) {
                let ezMessages = [
                    "Wait... This isn't what I typed!",
                    "Anyone else really like Rick Astley?",
                    "Hey helper, how play game?",
                    "Sometimes I sing soppy, love songs in the car.",
                    "I like long walks on the beach and playing Hypixel",
                    "Please go easy on me, this is my first game!",
                    "You're a great person! Do you want to play some Hypixel games with me?",
                    "In my free time I like to watch cat videos on Youtube",
                    "When I saw the witch with the potion, I knew there was trouble brewing.",
                    "If the Minecraft world is infinite, how is the sun spinning around it?",
                    "Hello everyone! I am an innocent player who loves everything Hypixel.",
                    "Plz give me doggo memes!",
                    "I heard you like Minecraft, so I built a computer in Minecraft in your Minecraft so you can Minecraft while you Minecraft",
                    "Why can't the Ender Dragon read a book? Because he always starts at the End.",
                    "Maybe we can have a rematch?",
                    "I sometimes try to say bad things then this happens :(",
                    "Behold, the great and powerful, my magnificent and almighty nemisis!",
                    "Doin a bamboozle fren.",
                    "Your clicks per second are godly. :scream_cat:",
                    "What happens if I add chocolate milk to macaroni and cheese?",
                    "Can you paint with all the colors of the wind",
                    "Blue is greener than purple for sure",
                    "I had something to say, then I forgot it.",
                    "When nothing is right, go left.",
                    "I need help, teach me how to play!",
                    "Your personality shines brighter than the sun.",
                    "You are very good at the game friend.",
                    "I like pineapple on my pizza",
                    "I like pasta, do you prefer nachos?",
                    "I like Minecraft pvp but you are truly better than me!",
                    "I have really enjoyed playing with you! <3",
                    "ILY <3",
                    "Pineapple doesn't go on pizza!",
                    "Lets be friends instead of fighting okay?",
                ];
                let randomNumber = Math.floor(Math.random() * ezMessages.length);
                const wb = await message.channel.createWebhook(
                    message.author.username, {
                        avatar: message.author.avatarURL({
                            format: "png",
                            size: 512,
                            dynamic: true,
                        }),
                    }
                );
                const webhookclient = new WebhookClient({
                    id: wb.id,
                    token: wb.token
                });
                await webhookclient.send(ezMessages[randomNumber]);
                await message.delete();
            }
        }
        if (
            message.channel.id === "904675293640392724" &&
            !message.author.bot &&
            message.content !== "ez"
        ) {
            if (
                message.type === "REPLY" &&
                message.mentions.repliedUser.bot !== true
            ) {
                const user = message.mentions.repliedUser.username;
                return mc.chat(
                    "/gc " +
                    `[${message.author.username} replying to ${user}] > ${message.content}`
                );
            } else if (
                message.type === "REPLY" &&
                message.mentions.repliedUser.bot === true
            ) {
                message.fetchReference().then((msg) => {
                    mc.chat(
                        "/gc " +
                        `[${message.author.username} replying to ${msg.embeds[0].title}] > ${message.content}`
                    );
                });
            } else {
                return mc.chat(
                    "/gc " + `[${message.author.username}] > ${message.content}`
                );
            }
        } else if (
            message.channel.id === "833607988798816279" &&
            message.type === "REPLY" &&
            !message.author.bot
        ) {
            message.fetchReference().then((msg) => {
                console.log(msg.embeds[0]);
            });
        } else {
            return;
        }
    }
}
