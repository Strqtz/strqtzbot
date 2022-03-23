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

export default class GuildinviteCommand extends Command {
    constructor() {
        super("guildinvite", {
            aliases: ["guildinvite", "ginvite"],
            description: {
                content: "Shows information about the discord bot",
                usage: "info",
                examples: ["-info"],
            },
            channel: "guild",
            args: [{
                id: "member",
                type: "string",
                description: "A member of the StopThrowing Guild",
            }, ],
            ownerOnly: true,
            cooldown: 120000,
            ratelimit: 1,
        });
    }

    /**
     * @param {Message} message
     * @param {{member:string}} args
     */

    async exec(message, args) {
        const uuidb4data = await cachios.get(
            `https://api.mojang.com/users/profiles/minecraft/${args.member}`, {
                ttl: 60,
            }
        );
        const uuid = uuidb4data.data;

        mc.chat(`/g invite ${uuid.name}`);
    }
