const { Command, AkairoMessage } = require('discord-akairo');
const { MessageEmbed, Message } = require('discord.js');
const winston = require('winston');
const Prefix = require('../../structures/models/Prefix');

class PrefixCommand extends Command {
    constructor() {
        super('prefix', {
            aliases: ['prefix'],
            description: {
              content: 'Change the bots prefix in your server',
                usage: 'prefix [prefix]',
                examples: [
                    'prefix !',
                ]
            },
            args: [
                { 
                    id: 'prefix',
                    default: '-',
                    type: (message, phrase) => {
                        return phrase;
                    },
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
        try {
            if(!args === undefined) {
               prefixSet = await Prefix.findOne({ guildID: message.guildId, guildPrefix: args.prefix});
                if(prefixSet) {
                    const setPrefixAlready = new MessageEmbed()
                    .setColor(colour)
                    .setDescription(`Please add the prefix you want to change to.`);
                    message.util.reply( { embeds: [setPrefixAlready] });
                }else if(!prefixSet && !args.prefix === undefined){
                    const prefixUpdate = await Prefix.findOneAndUpdate({
                    guildID: message.guildId
                }, {
                    guildPrefix: args.prefix
                }).then(() => {
                    const setPrefix = new MessageEmbed()
                    .setColor(colour)
                    .setDescription(`Set the prefix for ${message.guild} to ${args.prefix}`)
                    message.util.reply( { embeds: [setPrefix] } )
                });
                }
                
                 
                } else if(args === undefined) {
                    const undefinedPrefix = new MessageEmbed()
                    .setColor(colour)
                    .setDescription(`Please add the prefix you want to change to.`);
                    message.util.reply( { embeds: [undefinedPrefix] });
                }
                
        }catch(e) {
            message.util.reply(`There was an error executing this command.`);
            winston.log('error', e)
        }
    }
}

module.exports = PrefixCommand;