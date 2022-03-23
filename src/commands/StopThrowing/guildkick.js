import {
    AkairoMessage,
    Command
} from "discord-akairo";

import {
    Message
} from "discord.js";
import cachios from "cachios";
import {
    mc
} from "../../index.js";

export default class GuildKickCommand extends Command {
    constructor() {
        super("guildkick", {
            aliases: ["guildkick", "gkick"],
            description: {
                content: "Kicks a member from the StopThrowing Guild",
                usage: "guildkick <member> <reason>",
                examples: ["-gkick TheySimp short"],
            },
            channel: "guild",
            args: [{
                    id: "gmember",
                    type: "string",
                    description: "A member of the StopThrowing Guild",
                },
                {
                    id: "reason",
                    type: "string",
                    description: "The reason for kicking the player",
                },
            ],
            ownerOnly: true,
            cooldown: 120000,
            ratelimit: 1,
        });
    }

    /**
     * @param {Message} message
     * @param {{gmember:string; reason:string}} args
     */

    async exec(message, args) {
        const uuidb4data = await cachios.get(
            `https://api.mojang.com/users/profiles/minecraft/${args.gmember}`, {
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
                mc.chat(`/g kick ${args.gmember} ${args.reason}`);
                await message.author.send(`Successfully kicked ${args.gmember}`);
            } else {
                await message.author.send(`This user is not in StopThrowing}`);
            }
        } else {
            await message.author.send(`This user isn't even in a guild LMAO`);
        }
    }
}
