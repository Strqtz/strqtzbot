import {
    AkairoMessage,
    Command
} from "discord-akairo";
import {
    Interaction,
    Message,
    MessageActionRow,
    MessageEmbed,
    MessageSelectMenu,
} from "discord.js";
import Prefix from "../../structures/models/Prefix.js";

export default class HelpCommand extends Command {
    constructor() {
        super("help", {
            aliases: ["help"],
            description: {
                content: "A help command",
                usage: "help [prefix]",
                examples: ["-help ping"],
            },
            category: "info",
            args: [{
                id: "command",
                type: "commandAlias",
                match: "content",
                prompt: {
                    start: "What command do you need help with?",
                    retry: ":sad: Choose a valid command to find help for.",
                    optional: true,
                },
            }, ],
            slash: true,
            slashOptions: [{
                type: "STRING",
                name: "command",
                description: "The command you need help with",
                required: false,
            }, ],
            cooldown: 30000,
            ratelimit: 5,
        });
    }

    /**
     * @param { Message | AkairoMessage}  message
     * @param {{ command: Command | string }} args
     */

    async exec(message, args) {
        function capitalize(string) {
            const str = string.toString();
            return str[0].toUpperCase() + str.slice(1).toLowerCase();
        }
        let prefixSet;
        prefixSet = await Prefix.findOne({
            guildID: message.guildId,
        });

        const command = args.command ?
            typeof args.command === "string" ?
            this.client.commandHandler.modules.get(args.command) ?? null :
            args.command :
            null;
        const isOwner = this.client.isOwner(message.author);
        const isSuperUser = this.client.isSuperUser(message.author);
        if (!command) {
            const embed = new MessageEmbed()
                .setColor(this.client.colour)
                .setTimestamp();
            if (message.interaction) {
                embed.setFooter(
                    `For more information about a command use /help <command>`
                );
            } else {
                embed.setFooter(
                    `For more information about a command use ${prefixSet.guildPrefix}help <command>`
                );
            }

            for (const [, category] of this.client.commandHandler.categories) {
                const catFilter = category.filter((command) => {
                    if (command.ownerOnly && !isOwner) return false;
                    if (command.superUserOnly && !isSuperUser) return false;
                    return command;
                });
                const categoryNice = category.id
                    .replace(/(\b\w)/gi, (lc) => lc.toUpperCase())
                    .replace(/'(S)/g, (letter) => letter.toLowerCase());
                const categoryCommands = catFilter
                    .filter((cmd) => cmd.aliases.length > 0)
                    .map((cmd) => `\`${cmd.aliases[0]}\``);
                embed.addField(`${categoryNice}`, `${categoryCommands.join(", ")}`);
            }
            return await message.util.reply({
                embeds: [embed]
            });
        }
        if (command) {
            const helpEmbed = new MessageEmbed()
                .setColor(this.client.colour)
                .setTitle(capitalize(command.aliases[0]))
                .addFields({
                    name: `Category: `,
                    value: capitalize(command.category),
                }, {
                    name: `Description: `,
                    value: `${command.description.content}`,
                }, {
                    name: `Usage: `,
                    value: `${prefixSet.guildPrefix}${command.description.usage}`,
                }, {
                    name: `Examples: `,
                    value: `${command.description.examples}`,
                }, {
                    name: `Cooldown: `,
                    value: `${command.cooldown / 1000} seconds`,
                })
                .setTimestamp()
                .setFooter(
                    `Executed By ${message.member.displayName}`,
                    message.member.user.displayAvatarURL({
                        size: 64,
                        format: "png",
                        dynamic: true,
                    })
                );
            const aliase = command.aliases.join(", ").toString();
            helpEmbed.addField(`Aliases: `, aliase);
            if (command.slash === true) {
                helpEmbed.addField(`Slash: `, `:green_circle:`);
            }
            if (command.slashOnly === true) {
                helpEmbed.addField(`Slash-only: `, `:green_circle:`);
            }
            return await message.util.reply({
                embeds: [helpEmbed]
            });
        }
    }
}
