const { Command, AkairoMessage } = require('discord-akairo');
const { MessageEmbed, Message } = require('discord.js');

class PingCommand extends Command {
    constructor() {
        super('ping', {
            aliases: ['ping'],
            slash: true,
        });
    }

    /**
     * @param {AkairoMessage | Message}  message
     */

    async exec(message) {
        const colour = Math.floor(Math.random()*16777215).toString(16);
        const embed = new MessageEmbed()
        .setColor(colour)
        .setFields(
        { name: '🏓 Ping: ', value: `${this.client.ws.ping}ms`}
    )
        .setTimestamp()
        .setFooter(`Executed By ${message.member.displayName}`, message.member.user.displayAvatarURL({size:  64, format: "png", dynamic: true}));
        message.util.reply({ embeds: [embed] });
    }
}

module.exports = PingCommand;