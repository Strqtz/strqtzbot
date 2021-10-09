const { Command, AkairoMessage } = require('discord-akairo');
const { MessageEmbed, Message } = require('discord.js');
const winston = require('winston');
const Prefix = require('../../structures/models/Prefix');

class PrefixCommand extends Command {
    constructor() {
        super('prefix', {
            aliases: ['prefix'],
            category: 'config',
            description: {
              content: 'Change the bots prefix in your server',
                usage: 'prefix [prefix]',
                examples: [
                    '-prefix !',
                ]
            },
            args: [
                { 
                    id: 'prefix',
                    default: '-',
                    type: 'string',
                }
            ],
            channel: 'guild',
            slash: true,
            slashOptions: [
                {
                    name: 'prefix',
                    description: 'The prefix you want to change to',
                    type: 'STRING',
                    required: true,
            }
        ],
        });
    }

    /**
     * @param {AkairoMessage | Message}  message
     * @param {{prefix:string}} args
     */

    async exec(message, args) {
        const colour = Math.floor(Math.random()*16777215).toString(16);
        let prefixSet;
        const logger = winston.createLogger({
            level: 'info',
            format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
            colorize: true,
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' }),
            ]
        });
        const banPerms = message.member.permissions.has("BAN_MEMBERS");
        try {
            if(banPerms) {
                prefixSet = await Prefix.findOne({ guildID: message.guildId, guildPrefix: args.prefix});
                const prefixEmpty = '' || null;
                if(args.prefix && !prefixSet && !prefixEmpty) {
                    const prefixUpdate = await Prefix.findOneAndUpdate({
                        guildID: message.guildId
                    }, {
                        guildPrefix: args.prefix
                    }).then(() => {
                        const setPrefix = new MessageEmbed()
                            .setColor(colour)
                            .setDescription(`Set the prefix for ${message.guild} to ${args.prefix}`)
                            .setFooter(`Executed By ${message.member.displayName}`, message.member.user.displayAvatarURL({size:  64, format: "png", dynamic: true}));
                        message.util.reply( { embeds: [setPrefix] } );
                        logger.log('info', `${message.author.username} changed the prefix to [${args.prefix}] in ${message.guild.name}`);
                    });
                } else {
                    const setPrefixAlready = new MessageEmbed()
                        .setColor(colour)
                        .setDescription(`Please add the prefix you want to change to.`)
                        .setFooter(`Executed By ${message.member.displayName}`, message.member.user.displayAvatarURL({size:  64, format: "png", dynamic: true}));
                    message.util.reply( { embeds: [setPrefixAlready] });
                }
            } else {
                const noPerms = new MessageEmbed()
                    .setColor(colour)
                    .setDescription(`You do not have the required perms [BAN_MEMBERS]`)
            .setFooter(`Executed By ${message.member.displayName}`, message.member.user.displayAvatarURL({size:  64, format: "png", dynamic: true}));
                message.util.reply( { embeds: [noPerms] } );
            }



        }catch(e) {
            message.util.reply(`There was an error executing this command.`);
            logger.log('error', e)
        }
    }
}

module.exports = PrefixCommand;