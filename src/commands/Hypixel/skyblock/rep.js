import {
    AkairoMessage,
    Command
} from "discord-akairo";
import {
    Channel,
    Message,
    MessageEmbed,
    User
} from "discord.js";
import Rep from "../../../structures/models/Reps.js";
import LinkHypixel from "../../../structures/models/LinkHypixel.js";
import GuildSetting from "../../../structures/models/GuildSettings.js";

export default class RepCommand extends Command {
    constructor() {
        super("rep", {
            aliases: ["rep"],
            slash: true,
            slashOnly: true,
            slashOptions: [{
                    name: "change",
                    description: "Send a request to increase/decrease a users rep.",
                    type: "SUB_COMMAND",
                    options: [{
                            name: "type",
                            description: "Whether you want to decrease or increase the rep.",
                            type: "STRING",
                            choices: [{
                                    name: "Increase",
                                    value: "increase"
                                },
                                {
                                    name: "Decrease",
                                    value: "decrease"
                                },
                            ],
                            required: true,
                        },
                        {
                            name: "user",
                            description: "Please type the user you want to change the rep of.",
                            type: "USER",
                            required: true,
                        },
                        {
                            name: "reason",
                            description: "Please type the reason you are for the rep change",
                            type: "STRING",
                            required: true,
                        },
                        {
                            name: "image",
                            description: "An imgur link to a screenshot of a successful/unsuccessful trade or service.",
                            type: "STRING",
                            required: true,
                        },
                    ],
                },
                {
                    name: "accept",
                    description: "Declines a specific rep increase/decrease request. [ADMINS ONLY]",
                    type: "SUB_COMMAND",
                    options: [{
                        name: "id",
                        type: "NUMBER",
                        description: "The id of the rep request found in the footer",
                        required: true,
                    }, ],
                },
                {
                    name: "decline",
                    description: "Declines a specific rep increase/decrease request.",
                    type: "SUB_COMMAND",
                    options: [{
                        name: "id",
                        type: "NUMBER",
                        description: "The id of the rep request found in the footer",
                        required: true,
                    }, ],
                },
            ],
        });
    }

    /**
     * @param {Message | AkairoMessage} message
     * @param {{subcommand; user:User; reason:string; image: string; type:string; id:number;}} args
     */

    async exec(message, args) {
        try {
            const gsettings = await GuildSetting.findOne({
                guildID: message.guildId,
            });
            switch (args.subcommand) {
                case "change":
                    const reps = await Rep.findOne({
                        discordID: args.user.id
                    });
                    const linkedAccount = await LinkHypixel.findOne({
                        discordID: args.user.id,
                    });
                    if (linkedAccount) {
                        if (gsettings && !reps) {
                            let id;
                            const channel1 = await gsettings.get("loggingChannel", String);
                            const channel = this.client.guilds.cache
                                .get(message.guildId)
                                .channels.cache.get(channel1);
                            const embed = new MessageEmbed()
                                .setTitle(`${message.author.username}`)
                                .setDescription(
                                    `${message.author.username} wants to increase ${args.user.username}'s social credit for\n**Reason:**\n\`${args.reason}\`. \n **Evidence:**`
                                )
                                .setImage(args.image.toString());
                            channel.send({
                                embeds: [embed]
                            });
                            id = Rep.find({}).sort({
                                id: -1
                            }).get("id") ?? 0;
                            const create = await Rep.create({
                                discordID: linkedAccount.get("discordID"),
                                mcUUID: linkedAccount.get("uuid"),
                                rep: 0,
                                repRequest: [{
                                    id: id + 1,
                                    type: args.type,
                                    resolved: false,
                                }, ],
                            });
                            await create.save();
                        } else if (gsettings && reps) {
                            let id;
                            const channel1 = await gsettings.get("loggingChannel", String);
                            const channel = this.client.guilds.cache
                                .get(message.guildId)
                                .channels.cache.get(channel1);
                            console.log(channel.id);
                            const embed = new MessageEmbed()
                                .setTitle(`${message.author.username}`)
                                .setDescription(
                                    `${message.author.username} wants to increase ${args.user.username}'s social credit for\n**Reason:**\n\`${args.reason}\`\n **Evidence:**`
                                )
                                .setImage(args.image.toString());
                            channel.send({
                                embeds: [embed]
                            });
                            id = Rep.find({}).sort({
                                id: -1
                            }).get("id") ?? 0;
                            const rep = await Rep.findOne({
                                discordID: args.user.id
                            });
                        }
                    }
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }
}
