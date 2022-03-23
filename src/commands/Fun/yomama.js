import {
    AkairoMessage,
    Command
} from "discord-akairo";
import {
    Message,
    MessageEmbed,
    User
} from "discord.js";
import cachios from "cachios";

export default class YoMamaCommand extends Command {
    constructor() {
        super("yomama", {
            aliases: ["yomama", "jo", "mama", "jomama", "joe", "whosjoe"],
            description: {
                content: "You're Mother",
                usage: "yomama",
                examples: ["-yomama"],
            },
            args: [{
                id: "user",
                type: "userMention",
            }, ],
            slash: true,
            slashOptions: [{
                name: "user",
                type: "USER",
                description: "A Name",
                required: false,
            }, ],
            cooldown: 10000,
            ratelimit: 1,
        });
    }

    /**
     * @param {Message | AkairoMessage} message
     * @param {{user:User}} args
     */

    async exec(message, args) {
        const yo = await cachios.get("https://api.yomomma.info/", {
            ttl: 1,
        });
        const yomama = yo.data;

        const embed = new MessageEmbed()
            .setColor(this.client.colour)
            .setDescription(yomama.joke);
        if (args.user) {
            await message.util.send(
                "<@" + args.user + ">" + " You have been sacrificed to the yomama gods"
            );
        }
        await message.util.reply({
            embeds: [embed]
        });
    }
}
